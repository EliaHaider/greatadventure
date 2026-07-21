// Mobile hamburger menu toggle
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

// Offer banner — reads from Supabase, set up per SETUP-GUIDE.md
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

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
    showStatus('Something went wrong — please try again.', true);
  }
}
