// Supabase Edge Function: submit-enquiry
// Verifies the captcha (Google reCAPTCHA or Cloudflare Turnstile) on the server, then saves the enquiry.
// Secrets (Supabase > Edge Functions > Secrets):
//   Google reCAPTCHA: RECAPTCHA_PROJECT_ID, RECAPTCHA_API_KEY, RECAPTCHA_SITE_KEY
//   Cloudflare Turnstile: TURNSTILE_SECRET_KEY
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.)
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json();
    const token = clean(b.token, 4096);
    if (!token) return json({ error: "Please tick \"I'm not a robot\"." }, 400);

    let human = false;
    if (b.provider === "recaptcha") {
      // Google reCAPTCHA (Enterprise checkbox key)
      const projectId = Deno.env.get("RECAPTCHA_PROJECT_ID");
      const apiKey = Deno.env.get("RECAPTCHA_API_KEY");
      const siteKey = Deno.env.get("RECAPTCHA_SITE_KEY");
      if (!projectId || !apiKey || !siteKey) return json({ error: "Server is not configured yet." }, 500);
      const r = await fetch(
        `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: { token, siteKey } }) },
      );
      const a = await r.json();
      human = !!(a && a.tokenProperties && a.tokenProperties.valid === true);
    } else {
      // Cloudflare Turnstile
      const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
      if (!secret) return json({ error: "Server is not configured yet." }, 500);
      const form = new FormData();
      form.append("secret", secret);
      form.append("response", token);
      const v = await (await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form })).json();
      human = !!v.success;
    }
    if (!human) return json({ error: "Security check failed. Please try again." }, 400);

    const name = clean(b.name, 120), email = clean(b.email, 200), message = clean(b.message, 4000);
    if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "Please check your name, email and message." }, 400);
    }
    const row = {
      name, email, message, status: "new",
      tour: clean(b.tour, 120) || null,
      phone: clean(b.phone, 60) || null,
      country: clean(b.country, 80) || null,
      start_date: /^\d{4}-\d{2}-\d{2}$/.test(clean(b.start_date, 10)) ? b.start_date : null,
      end_date: /^\d{4}-\d{2}-\d{2}$/.test(clean(b.end_date, 10)) ? b.end_date : null,
      date_notes: clean(b.date_notes, 300) || null,
      group_size: clean(b.group_size, 40) || null,
    };
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let { error } = await sb.from("inquiries").insert(row);
    if (error) {
      // new columns not added yet: keep the details inside the message so nothing is lost
      const extra = [row.phone && `Phone/WhatsApp: ${row.phone}`, row.country && `Country: ${row.country}`,
        row.start_date && `Start: ${row.start_date}`, row.end_date && `End: ${row.end_date}`,
        row.date_notes && `Date notes: ${row.date_notes}`, row.group_size && `Group size: ${row.group_size}`].filter(Boolean).join("\n");
      const r2 = await sb.from("inquiries").insert({ name, email, tour: row.tour, status: "new", message: message + (extra ? "\n\n---\n" + extra : "") });
      if (r2.error) { console.error(r2.error); return json({ error: "Could not save your enquiry." }, 500); }
    }
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong." }, 500);
  }
});
