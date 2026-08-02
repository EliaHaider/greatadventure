// Supabase Edge Function: notify-new-submission
//
// Triggered by a Database Webhook whenever a new row is inserted into
// "reviews" or "inquiries". Sends an email notification via Resend
// (https://resend.com) to elia@greatadv.com so nothing gets missed.
//
// Deployment instructions are in SETUP-GUIDE.md, section 7.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = "elia@greatadv.com";
// Update this once your real domain is set up on Resend (see SETUP-GUIDE.md).
// Until then, Resend's shared "onboarding@resend.dev" address works for testing.
const FROM_EMAIL = "Great Adventure Website <notifications@greatadv.com>";
const ADMIN_URL = "https://greatadv.com/admin.html"; // update to your real domain

serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY secret.");
      return new Response("Server not configured", { status: 500 });
    }

    const payload = await req.json();
    // Supabase Database Webhooks send: { type, table, record, old_record, schema }
    const table = payload.table;
    const record = payload.record;

    let subject = "";
    let html = "";

    if (table === "reviews") {
      subject = `New review submitted — ${record.name}`;
      html = `
        <h2>New review awaiting approval</h2>
        <p><b>Name:</b> ${escapeHtml(record.name)}</p>
        <p><b>Country:</b> ${escapeHtml(record.country || "-")}</p>
        <p><b>Rating:</b> ${record.rating} / 5</p>
        <p><b>Message:</b> ${escapeHtml(record.message)}</p>
        <p style="margin-top:20px;"><a href="${ADMIN_URL}">Open admin panel to approve or delete &rarr;</a></p>
      `;
    } else if (table === "inquiries") {
      subject = `New enquiry — ${record.name} (${record.tour || "no tour specified"})`;
      html = `
        <h2>New enquiry received</h2>
        <p><b>Name:</b> ${escapeHtml(record.name)}</p>
        <p><b>Email:</b> ${escapeHtml(record.email)}</p>
        <p><b>Tour:</b> ${escapeHtml(record.tour || "-")}</p>
        <p><b>Message:</b> ${escapeHtml(record.message || "-")}</p>
        <p style="margin-top:20px;"><a href="${ADMIN_URL}">Open admin panel to reply or mark as contacted &rarr;</a></p>
      `;
    } else {
      // Some other table triggered this by mistake — ignore it quietly.
      return new Response("ignored: unrecognised table", { status: 200 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", errText);
      return new Response("Email send failed", { status: 502 });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("notify-new-submission error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
