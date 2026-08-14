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
const SUPABASE_URL = "https://jyotzntfainfpgxbolum.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5b3R6bnRmYWluZnBneGJvbHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTQ0ODgsImV4cCI6MjEwMDIzMDQ4OH0.zbN70O5KdI0WDc8m0Pru6LBCQnBMwBnTXmDfXlJal1o";

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

// ============ Contact form: submit enquiry to Supabase ============
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

  // honeypot — if this hidden field got filled, it's a bot, silently drop it
  if(document.getElementById('inq-hp').value){
    showStatus("Thanks! We'll be in touch shortly.", false);
    document.getElementById('inquiryForm').reset();
    return;
  }

  const name = document.getElementById('inq-name').value.trim();
  const email = document.getElementById('inq-email').value.trim();
  const tour = document.getElementById('inq-tour').value;
  const message = document.getElementById('inq-message').value.trim();

  if(!name || !email){
    showStatus("Please fill in your name and email.", true);
    return;
  }

  const sb = getSb();
  if(!sb){
    showStatus("Booking system isn't connected yet — please WhatsApp us directly instead.", true);
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Sending…";

  try{
    const { error } = await sb.from('inquiries').insert({
      name: name,
      email: email,
      tour: tour,
      message: message,
      status: 'new'
    });
    if(error) throw error;
    showStatus("Thanks, " + name.split(' ')[0] + "! We've received your enquiry and will reply within a day.", false);
    document.getElementById('inquiryForm').reset();
  }catch(err){
    const detail = (err && err.message) ? err.message : 'unknown error';
    showStatus("Something went wrong: " + detail + " — please try WhatsApp instead.", true);
  }finally{
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

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
      grid.innerHTML = '<div class="reviews-empty"><p>No reviews yet — be the first to share your experience of the trek.</p></div>';
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
