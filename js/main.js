// ============ Email link: copy on click instead of relying on mailto: ============
// mailto: only opens something if the visitor's device/browser has a default
// mail app configured — many desktop browsers, and in-app browsers like
// Instagram/Facebook, don't, which made clicking (or right-click > open in
// new tab) look like it "did nothing" or bounced back to the site. A left
// click now always copies the address instead, which works everywhere.
function copyEmail(link, email, evt){
  if(evt) evt.preventDefault();
  const original = link.textContent;
  const done = function(){
    link.textContent = 'Copied — ' + email;
    setTimeout(function(){ link.textContent = original; }, 1800);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(email).then(done).catch(function(){
      window.prompt('Copy this email address:', email);
    });
  } else {
    window.prompt('Copy this email address:', email);
  }
  return false;
}
// ============ Print / Save itinerary as PDF ============
function printItinerary(){
  window.print();
}

// ============ Itinerary quickfacts: click Duration or Difficulty for more info ============
function scrollToDayByDay(){
  const el = document.getElementById('day-by-day');
  if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
}
function toggleDifficultyInfo(el){
  const panel = document.getElementById('difficultyInfo');
  if(!panel) return;
  const isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if(el) el.setAttribute('aria-expanded', String(!isOpen));
  if(!isOpen) panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

// ============ Tour filter tabs ============
document.addEventListener('DOMContentLoaded', function(){
  const filterBar = document.getElementById('tourFilters');
  if(!filterBar) return;
  const cards = document.querySelectorAll('#tourGrid .tcard');
  filterBar.addEventListener('click', function(e){
    const btn = e.target.closest('.filter-tab');
    if(!btn) return;
    filterBar.querySelectorAll('.filter-tab').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    cards.forEach(function(card){
      // The "Custom itinerary" card is always relevant, no matter which filter
      // tab is active — travellers should always see the option to ask for a
      // destination that isn't on the website yet.
      const alwaysShow = card.getAttribute('data-always-show') === 'true';
      const show = alwaysShow || (filter === 'All' || card.getAttribute('data-category') === filter);
      if(show){
        card.classList.remove('fade-hidden');
        requestAnimationFrame(function(){ card.classList.remove('fade-out'); });
      }else{
        card.classList.add('fade-out');
        setTimeout(function(){ card.classList.add('fade-hidden'); }, 250);
      }
    });
  });
});

// ============ Mobile hamburger menu toggle ============
function toggleMenu(){
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('mobileMenu').classList.toggle('open');
}
document.addEventListener('click', function(e){
  const menu = document.getElementById('mobileMenu');
  const burger = document.getElementById('hamburger');
  if(!menu || !burger) return;
  if(menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)){
    menu.classList.remove('open');
    burger.classList.remove('open');
  }
});

// Nav goes from glass-transparent (over the hero photo) to solid once scrolled,
// so it always stays readable. One lightweight scroll listener, no layout thrash.
(function(){
  const header = document.querySelector('header');
  if(!header) return;
  let ticking = false;
  function updateHeader(){
    header.classList.toggle('scrolled', window.scrollY > 60);
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();
})();

// ============ Hero photo slideshow ============
// Slowly crossfades between a few hero images instead of showing one static photo.
(function(){
  const slides = document.querySelectorAll('.hero-photo .hero-slide');
  if(slides.length < 2) return;
  let idx = 0;
  setInterval(function(){
    const next = (idx + 1) % slides.length;
    slides[idx].classList.remove('active');
    slides[next].classList.add('active');
    idx = next;
  }, 7000); // change roughly every 7s, fading gradually via the CSS transition
})();

// Offer banner — reads from Supabase, set up per SETUP-GUIDE.md
const SUPABASE_URL = "https://liubwwceifhbgmogvagu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8uDHbP9KikCbCwvIMiDa0A_NjFKKuZF";

async function loadOfferBanner(){
  if(SUPABASE_URL.indexOf("PASTE_") === 0) return;
  try{
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.from("announcements").select("*").eq("id", 1).single();
    if(error || !data || !data.active) return;
    document.getElementById("offer-banner-text").textContent = data.title + (data.message ? " — " + data.message : "");
    document.getElementById("offer-banner").style.display = "block";
  }catch(e){ /* fail silently, site works fine without the banner */ }
}
loadOfferBanner();

// ============ Image loading skeletons ============
// Every photo shows a shimmering "Loading…" skeleton until it finishes
// loading (or forever, gracefully, if the file hasn't been added yet).
function initPhotoLoaders(){
  document.querySelectorAll('.js-photo').forEach(function(img){
    const frame = img.closest('.img-frame');
    const skel = frame ? frame.querySelector('.img-skeleton') : null;
    function onLoad(){
      img.classList.add('is-loaded');
      if(skel) skel.classList.add('hide');
    }
    function onError(){
      // keep the skeleton visible — looks like "still loading" rather than a broken/missing state
      img.style.visibility = 'hidden';
    }
    if(img.complete && img.naturalWidth > 0){
      onLoad();
    }else{
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    }
  });
}
document.addEventListener('DOMContentLoaded', initPhotoLoaders);

// ============ FAQ accordion ============
function toggleFaq(el){
  const item = el.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(i){ i.classList.remove('open'); });
  if(!wasOpen) item.classList.add('open');
}

// ============ Hero stat count-up ============
function animateCount(el){
  const target = parseInt(el.getAttribute('data-count'), 10);
  if(!target) return;
  const duration = 1200;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString();
    if(progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('[data-count]').forEach(animateCount);
});

// ============ Scroll reveal for section headers/cards ============
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.section-head').forEach(function(el){ el.classList.add('reveal'); });
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
});

// ============ Route line draw-in animation ============
document.addEventListener('DOMContentLoaded', function(){
  const routeLine = document.querySelector('.route-svg polyline');
  if(!routeLine) return;
  const length = routeLine.getTotalLength ? routeLine.getTotalLength() : 1200;
  routeLine.style.strokeDasharray = length;
  routeLine.style.strokeDashoffset = length;
  const io2 = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        routeLine.style.transition = 'stroke-dashoffset 1.8s ease';
        routeLine.style.strokeDashoffset = '0';
        io2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  io2.observe(document.querySelector('.route-line'));
});

// ============ Reviews: fetch + render (max 9 shown, newest first) ============
const REVIEWS_DISPLAY_LIMIT = 9;

function getSb(){
  if(SUPABASE_URL.indexOf("PASTE_") === 0) return null;
  if(!window._sbClient) window._sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return window._sbClient;
}

// ============ Contact form: submit enquiry ============
// CAPTCHA ("I'm not a robot"): paste ONE site key below.
//   Google reCAPTCHA  -> RECAPTCHA_SITE_KEY   (steps: supabase/STEPS-CAPTCHA-GOOGLE.txt)
//   Cloudflare        -> TURNSTILE_SITE_KEY   (steps: supabase/STEPS-CAPTCHA.txt)
// While both are empty, no captcha is shown and only the hidden anti-spam field protects the form.
const RECAPTCHA_SITE_KEY = '';
const TURNSTILE_SITE_KEY = '';
const CAPTCHA_PROVIDER = RECAPTCHA_SITE_KEY ? 'recaptcha' : (TURNSTILE_SITE_KEY ? 'turnstile' : '');

var _capWidgetId = null, _capToken = null;

function initCaptcha(){
  const host = document.getElementById('inq-captcha');
  if(!host || !CAPTCHA_PROVIDER) return;
  function onToken(t){ _capToken = t; }
  function onClear(){ _capToken = null; }
  const s = document.createElement('script');
  s.async = true; s.defer = true;
  if(CAPTCHA_PROVIDER === 'recaptcha'){
    s.src = 'https://www.google.com/recaptcha/enterprise.js?render=explicit';
    s.onload = function(){
      window.grecaptcha.enterprise.ready(function(){
        _capWidgetId = window.grecaptcha.enterprise.render(host, {
          sitekey: RECAPTCHA_SITE_KEY, callback: onToken, 'expired-callback': onClear, 'error-callback': onClear
        });
      });
    };
  } else {
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.onload = function(){
      _capWidgetId = window.turnstile.render(host, {
        sitekey: TURNSTILE_SITE_KEY, callback: onToken, 'expired-callback': onClear, 'error-callback': onClear
      });
    };
  }
  document.head.appendChild(s);
}
function resetCaptcha(){
  if(!CAPTCHA_PROVIDER || _capWidgetId === null) return;
  _capToken = null;
  try{
    if(CAPTCHA_PROVIDER === 'recaptcha') window.grecaptcha.enterprise.reset(_capWidgetId);
    else window.turnstile.reset(_capWidgetId);
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', function(){
  initCaptcha();
  // keep the date pickers sensible
  const start = document.getElementById('inq-start'), end = document.getElementById('inq-end');
  if(start && end){
    const today = new Date().toISOString().slice(0, 10);
    start.min = today; end.min = today;
    start.addEventListener('change', function(){ if(start.value){ end.min = start.value; if(end.value && end.value < start.value) end.value = start.value; } });
  }
});

async function submitInquiry(evt){
  evt.preventDefault();
  const btn = document.getElementById('inq-submit-btn');
  const statusEl = document.getElementById('inq-status');
  function showStatus(msg, isErr){
    statusEl.style.display = 'block';
    statusEl.textContent = msg;
    statusEl.style.background = isErr ? 'rgba(224,75,74,0.12)' : 'rgba(28,138,75,0.12)';
    statusEl.style.color = isErr ? 'var(--bad)' : 'var(--good)';
  }
  function val(id){ const el = document.getElementById(id); return el ? el.value.trim() : ''; }

  // honeypot: a hidden field only bots fill in
  if(val('inq-hp')){
    showStatus("Thanks! We'll be in touch shortly.", false);
    document.getElementById('inquiryForm').reset();
    return;
  }

  const payload = {
    name: val('inq-name'), email: val('inq-email'), phone: val('inq-phone'), country: val('inq-country'),
    tour: val('inq-tour'), start_date: val('inq-start'), end_date: val('inq-end'),
    date_notes: val('inq-datenotes'), group_size: val('inq-group'), message: val('inq-message')
  };

  if(!payload.name || !payload.email || !payload.message){
    showStatus("Please fill in your name, email and message.", true);
    return;
  }
  if(payload.start_date && payload.end_date && payload.end_date < payload.start_date){
    showStatus("The end date is before the start date. Please check your dates.", true);
    return;
  }
  // captcha (only when a Turnstile key has been added)
  if(CAPTCHA_PROVIDER && !_capToken){ showStatus("Please tick \"I'm not a robot\" first.", true); return; }

  const sb = getSb();
  if(!sb){
    showStatus("The enquiry system isn't connected yet. Please WhatsApp us directly instead.", true);
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Sending…";

  try{
    if(CAPTCHA_PROVIDER){
      // verified on the server (Supabase Edge Function), then saved
      const res = await sb.functions.invoke('submit-enquiry', { body: Object.assign({}, payload, { token: _capToken, provider: CAPTCHA_PROVIDER }) });
      if(res.error) throw res.error;
      if(res.data && res.data.error) throw new Error(res.data.error);
    } else {
      const row = {
        name: payload.name, email: payload.email, tour: payload.tour || null, message: payload.message, status: 'new',
        phone: payload.phone || null, country: payload.country || null, start_date: payload.start_date || null,
        end_date: payload.end_date || null, date_notes: payload.date_notes || null, group_size: payload.group_size || null
      };
      let { error } = await sb.from('inquiries').insert(row);
      if(error){
        // Database not upgraded yet? Save the same details inside the message so nothing is lost.
        const extra = [
          payload.phone && ('Phone/WhatsApp: ' + payload.phone), payload.country && ('Country: ' + payload.country),
          payload.start_date && ('Start: ' + payload.start_date), payload.end_date && ('End: ' + payload.end_date),
          payload.date_notes && ('Date notes: ' + payload.date_notes), payload.group_size && ('Group size: ' + payload.group_size)
        ].filter(Boolean).join('\n');
        const legacy = await sb.from('inquiries').insert({
          name: payload.name, email: payload.email, tour: payload.tour || null,
          message: payload.message + (extra ? '\n\n---\n' + extra : ''), status: 'new'
        });
        if(legacy.error) throw legacy.error;
      }
    }
    if(window.gtag) gtag('event', 'generate_lead', { method: 'enquiry_form', tour: payload.tour || 'none' });
    showStatus("Thanks, " + payload.name.split(' ')[0] + "! We've received your enquiry and will reply within a day.", false);
    document.getElementById('inquiryForm').reset();
  }catch(err){
    const detail = (err && err.message) ? err.message : 'unknown error';
    showStatus("Something went wrong: " + detail + " Please try again, or WhatsApp us instead.", true);
  }finally{
    btn.disabled = false;
    btn.textContent = originalText;
    resetCaptcha();
  }
}

// Count WhatsApp taps as a conversion in Google Analytics (used for ad measurement)
document.addEventListener('click', function(e){
  const a = e.target.closest ? e.target.closest('a[href*="wa.me"]') : null;
  if(a && window.gtag) gtag('event', 'whatsapp_click', { page_path: location.pathname });
});

// ============ Gallery: show 5 photos, reveal the rest on click ============
function toggleGalleryPhotos(){
  const grid = document.getElementById('galGrid');
  const btn = document.getElementById('galMoreBtn');
  if(!grid || !btn) return;
  const expanded = grid.classList.toggle('expanded');
  btn.innerHTML = expanded ? 'View fewer photos &uarr;' : 'View more photos &darr;';
}
// The gallery tries images/gallery/1.jpg through 20.jpg — any that don't
// exist are removed automatically (see the inline onerror on each tile).
// Once the page has finished trying to load them all, hide "View more"
// if nothing beyond the first 5 actually exists.
function checkGalleryMoreButton(){
  const grid = document.getElementById('galGrid');
  const btn = document.getElementById('galMoreBtn');
  if(!grid || !btn) return;
  const hasExtra = !!grid.querySelector('.gal-extra');
  btn.style.display = hasExtra ? '' : 'none';
}
window.addEventListener('load', checkGalleryMoreButton);

// ============ Lightbox gallery viewer ============
// Builds its image list live from whichever gallery photos are actually
// present in the DOM at the moment you click (missing numbered files are
// already removed by the onerror handler above), so navigation always
// matches exactly what's visible — no gaps, no broken slides.
let _lbIndex = 0;
function _lbImages(){
  return Array.prototype.slice.call(document.querySelectorAll('#galGrid .js-photo'));
}
function openLightbox(imgEl){
  const images = _lbImages();
  const idx = images.indexOf(imgEl);
  _lbIndex = idx === -1 ? 0 : idx;
  const overlay = document.getElementById('lightboxOverlay');
  if(!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  _lbRender();
  document.addEventListener('keydown', _lbKeyHandler);
}
function closeLightbox(){
  const overlay = document.getElementById('lightboxOverlay');
  if(!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _lbKeyHandler);
}
function lightboxStep(dir){
  const images = _lbImages();
  if(images.length === 0) return;
  _lbIndex = (_lbIndex + dir + images.length) % images.length;
  _lbRender();
}
function _lbRender(){
  const images = _lbImages();
  if(images.length === 0){ closeLightbox(); return; }
  const src = images[_lbIndex];
  const lbImg = document.getElementById('lightboxImg');
  const counter = document.getElementById('lightboxCounter');
  lbImg.classList.remove('loaded');
  lbImg.src = src.src;
  lbImg.alt = src.alt || '';
  lbImg.onload = function(){ lbImg.classList.add('loaded'); };
  if(counter) counter.textContent = (_lbIndex + 1) + ' / ' + images.length;
}
function _lbKeyHandler(e){
  if(e.key === 'Escape') closeLightbox();
  else if(e.key === 'ArrowLeft') lightboxStep(-1);
  else if(e.key === 'ArrowRight') lightboxStep(1);
}

// ============ "Giants of Baltistan" peak cards: View More accordion ============
function togglePeakInfo(btn){
  const card = btn.closest('.peak-card');
  if(!card) return;
  const isOpen = card.classList.contains('open');
  // Only one open at a time
  document.querySelectorAll('.peak-card.open').forEach(function(c){
    if(c !== card){
      c.classList.remove('open');
      const b = c.querySelector('.peak-more-btn');
      if(b) b.innerHTML = 'View more &darr;';
    }
  });
  card.classList.toggle('open', !isOpen);
  btn.innerHTML = card.classList.contains('open') ? 'View less &uarr;' : 'View more &darr;';
}
// Auto-close any open peak card once the section scrolls out of view
document.addEventListener('DOMContentLoaded', function(){
  const peaksSection = document.getElementById('peaks');
  if(!peaksSection || !window.IntersectionObserver) return;
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting){
        document.querySelectorAll('.peak-card.open').forEach(function(c){
          c.classList.remove('open');
          const b = c.querySelector('.peak-more-btn');
          if(b) b.innerHTML = 'View more &darr;';
        });
      }
    });
  }, { threshold: 0 });
  io.observe(peaksSection);
});

// ============ Auto-select tour in contact form from ?tour= URL param ============
// Lets "Enquire now" buttons on itinerary pages land here with the right tour pre-selected.
document.addEventListener('DOMContentLoaded', function(){
  const params = new URLSearchParams(window.location.search);
  const tourParam = params.get('tour');
  const select = document.getElementById('inq-tour');
  if(tourParam && select){
    const options = Array.from(select.options);
    const match = options.find(function(o){ return o.value === tourParam; });
    if(match) select.value = tourParam;
  }
});

// ============ Auto-select tour when "Enquire Now" is clicked on this same page ============
// Used by tour cards on the homepage itself (e.g. the Custom itinerary card), where the
// link only jumps to #contact rather than reloading the page with a ?tour= param.
function goToEnquiry(tourName){
  const select = document.getElementById('inq-tour');
  if(select){
    const options = Array.from(select.options);
    const match = options.find(function(o){ return o.value === tourName; });
    if(match) select.value = tourName;
  }
}

function renderStars(n){
  n = Math.max(1, Math.min(5, parseInt(n, 10) || 5));
  let out = "";
  for(let i = 1; i <= 5; i++){ out += (i <= n) ? "\u2605" : "\u2606"; }
  return out;
}

async function loadReviews(){
  const grid = document.getElementById('reviews-grid');
  if(!grid) return;
  const sb = getSb();
  if(!sb){
    grid.innerHTML = '<div class="reviews-empty"><p>Reviews will appear here once the site is fully connected. Be the first to write one!</p></div>';
    return;
  }
  try{
    const { data, error } = await sb
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(REVIEWS_DISPLAY_LIMIT);
    if(error) throw error;
    if(!data || data.length === 0){
      grid.innerHTML = '<div class="reviews-empty"><p>No reviews yet &mdash; we&rsquo;re a new company, so our first travellers&rsquo; reviews are still to come. Our founder has guided these routes for around 26 years. Ask us about early-bird rates for our first 2027 groups.</p></div>';
      return;
    }
    grid.innerHTML = data.map(function(r){
      const name = escapeHtml(r.name || 'Traveller');
      const country = escapeHtml(r.country || '');
      const msg = escapeHtml(r.message || '');
      return '<div class="tquote">' +
        '<div class="stars">' + renderStars(r.rating) + '</div>' +
        '<p>"' + msg + '"</p>' +
        '<div class="who"><div class="who-text">' + name + (country ? ' &mdash; ' + country : '') + '</div></div>' +
        '</div>';
    }).join('');
  }catch(e){
    grid.innerHTML = '<div class="reviews-empty"><p>Couldn\'t load reviews right now. Please refresh the page.</p></div>';
  }
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadReviews);

// ============ Review modal: open/close, star picker, char count, submit ============
let rvSelectedRating = 0;

function openReviewModal(){
  const backdrop = document.getElementById('reviewModalBackdrop');
  if(!backdrop) return;
  backdrop.classList.add('open');
  document.getElementById('reviewFormWrap').style.display = 'block';
  document.getElementById('reviewThanks').style.display = 'none';
}

function closeReviewModal(e){
  if(e) e.preventDefault();
  const backdrop = document.getElementById('reviewModalBackdrop');
  if(backdrop) backdrop.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function(){
  const stars = document.getElementById('rv-stars');
  if(stars){
    stars.querySelectorAll('span').forEach(function(s){
      s.addEventListener('click', function(){
        rvSelectedRating = parseInt(s.getAttribute('data-v'), 10);
        stars.querySelectorAll('span').forEach(function(el){
          el.classList.toggle('active', parseInt(el.getAttribute('data-v'), 10) <= rvSelectedRating);
        });
      });
    });
  }
  const msg = document.getElementById('rv-message');
  const count = document.getElementById('rv-charcount');
  if(msg && count){
    msg.addEventListener('input', function(){ count.textContent = msg.value.length; });
  }
});

async function submitReview(){
  const statusEl = document.getElementById('rv-status');
  const name = document.getElementById('rv-name').value.trim();
  const country = document.getElementById('rv-country').value.trim();
  const message = document.getElementById('rv-message').value.trim();
  const honeypot = document.getElementById('rv-website').value.trim();

  function showStatus(msgText, isErr){
    statusEl.textContent = msgText;
    statusEl.className = 'rv-status show' + (isErr ? ' err' : '');
  }

  if(honeypot){ return; } // silently drop likely-bot submissions
  if(!name || !message || rvSelectedRating === 0){
    showStatus('Please add your name, a rating, and a short review.', true);
    return;
  }
  if(message.length > 400){
    showStatus('Please keep your review under 400 characters.', true);
    return;
  }

  const sb = getSb();
  if(!sb){
    showStatus('Reviews aren\'t connected yet — please try again later.', true);
    return;
  }

  try{
    const { error } = await sb.from('reviews').insert({
      name: name,
      country: country,
      rating: rvSelectedRating,
      message: message,
      approved: false
    });
    if(error) throw error;
    document.getElementById('reviewFormWrap').style.display = 'none';
    document.getElementById('reviewThanks').style.display = 'block';
  }catch(e){
    const detail = (e && e.message) ? e.message : 'unknown error';
    showStatus('Something went wrong: ' + detail, true);
  }
}


// ============ Group departures: load upcoming dates from Supabase ============
// Reads active, upcoming rows from the "departures" table (see
// supabase/departures.sql). With no rows — or any error — the default
// "Join a group, or go private" steps already in the page simply stay.
function _depDate(iso){
  const p = String(iso || '').split('-');
  if(p.length !== 3) return null;
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}
function _depFmt(d, withYear){
  return d.toLocaleDateString('en-GB', withYear ? { day:'numeric', month:'short', year:'numeric' } : { day:'numeric', month:'short' });
}
function joinDeparture(el){
  const tour = el.getAttribute('data-tour') || '';
  const dates = el.getAttribute('data-dates') || '';
  goToEnquiry(tour);
  const msg = document.getElementById('inq-message');
  if(msg) msg.value = "I'd like to join the group departure on " + dates + ".";
}
async function loadDepartures(){
  const wrap = document.getElementById('departures-table-wrap');
  if(!wrap) return;
  try{
    const sb = getSb();
    if(!sb) return;
    const t = new Date();
    const todayIso = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    const { data, error } = await sb
      .from('departures')
      .select('*')
      .eq('active', true)
      .gte('start_date', todayIso)
      .order('start_date', { ascending: true })
      .limit(12);
    if(error || !data || data.length === 0) return;

    const rows = data.map(function(r){
      const s = _depDate(r.start_date);
      if(!s) return '';
      const e = r.end_date ? _depDate(r.end_date) : null;
      const dates = e ? (_depFmt(s, false) + ' \u2013 ' + _depFmt(e, true)) : _depFmt(s, true);
      const tour = escapeHtml(r.tour || '');
      const note = r.note ? '<div class="dep-note">' + escapeHtml(r.note) + '</div>' : '';
      const left = (typeof r.spots_left === 'number') ? r.spots_left : null;
      let status = r.status || 'open';
      if(left === 0) status = 'full';
      else if(status === 'open' && left !== null && left <= 3) status = 'few';
      let badge;
      if(status === 'full') badge = '<span class="badge" style="background:rgba(192,57,43,0.1);color:var(--bad);">Full &mdash; waiting list</span>';
      else if(status === 'few') badge = '<span class="badge season">' + (left !== null ? left + ' spots left' : 'Few spots left') + '</span>';
      else badge = '<span class="badge diff">' + (left !== null ? left + ' spots open' : 'Open') + '</span>';
      const price = (typeof r.price_usd === 'number') ? '<div class="dep-price">$' + r.price_usd.toLocaleString() + ' <small>/person</small></div>' : '';
      const label = status === 'full' ? 'Join waiting list' : 'Join this date';
      return '<div class="dep-row">' +
        '<div class="dep-date">' + escapeHtml(dates) + '</div>' +
        '<div><div class="dep-tour">' + tour + '</div>' + note + '<div class="dep-badges">' + badge + '</div></div>' +
        '<div class="dep-side">' + price +
          '<a href="#contact" class="btn btn-primary btn-sm" data-tour="' + tour + '" data-dates="' + escapeHtml(dates) + '" onclick="joinDeparture(this)">' + label + '</a>' +
        '</div></div>';
    }).join('');
    if(!rows) return;
    wrap.innerHTML = '<div class="dep-list">' + rows + '</div>' +
      '<p class="dep-foot">Not seeing a date that suits you? <a href="#contact">Tell us your dates</a> and we will build a group around them.</p>';
  }catch(err){ /* keep the default steps */ }
}
document.addEventListener('DOMContentLoaded', loadDepartures);


// ============ Image protection (deterrent only) ============
// Stops casual saving: right-click menu, dragging images out, long-press save on mobile,
// and text/image selection. It cannot stop screenshots or browser developer tools.
(function(){
  var css = document.createElement('style');
  css.textContent = 'img{-webkit-user-drag:none;user-drag:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}' +
                    '.hero-photo,.tcard-img,.gallery-item,.lightbox img{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}';
  document.head.appendChild(css);
  function isPhoto(el){
    if(!el || !el.tagName) return false;
    if(el.tagName === 'IMG' || el.tagName === 'PICTURE' || el.tagName === 'VIDEO') return true;
    try { return getComputedStyle(el).backgroundImage !== 'none'; } catch(e){ return false; }
  }
  document.addEventListener('contextmenu', function(e){ if(isPhoto(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function(e){ if(e.target && e.target.tagName === 'IMG') e.preventDefault(); });
})();

// ============ Local preview helper ============
// Opened straight from disk (file://), a folder link has no index page, so point it at index.html.
// Online, links stay clean: /trekking/gondogoro-la/ (no index.html in the address).
(function(){
  if(location.protocol !== 'file:') return;
  function fix(){
    document.querySelectorAll('a[href]').forEach(function(a){
      var h = a.getAttribute('href');
      if(!h || /^(https?:|mailto:|tel:|javascript:|data:|#|\/\/)/i.test(h)) return;
      var m = h.match(/^([^?#]*)([?#][\s\S]*)?$/), p = m[1], rest = m[2] || '';
      if(!p) return;
      if(/\.[a-z0-9]+$/i.test(p.split('/').pop())) return;
      if(p.charAt(p.length - 1) !== '/') p += '/';
      a.setAttribute('href', p + 'index.html' + rest);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix); else fix();
})();
