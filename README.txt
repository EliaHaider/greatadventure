GREAT ADVENTURE — SITE FILES
=============================

HOW TO USE THIS ZIP
--------------------
Upload everything in this zip to your hosting exactly as it is arranged —
same folder names, same structure. Do not rename any folder.

You also need to add your own "images" folder (with your logo, tour
photos, gallery photos, etc.) at the same top level as index.html —
it is NOT included in this zip since I don't have your actual photo
files. Just drop your existing "images" folder in alongside these files
and everything will link up correctly.

FINAL STRUCTURE ON YOUR SERVER SHOULD LOOK LIKE THIS:
--------------------------------------------------------
/  (your site's root folder)
├── index.html                          → Homepage
├── css/
│   └── style.css                       → All site styling
├── js/
│   └── main.js                         → All site behaviour/scripts
├── images/                             → (add your own — not in this zip)
│
├── terms/
│   └── index.html                      → Booking Terms & Cancellation Policy
│                                          Opens as: yoursite.com/terms/
│
├── k2-base-camp/
│   └── index.html                      → "K2 Base Camp & Concordia" itinerary page
│                                          Opens as: yoursite.com/k2-base-camp/
│
├── k2-broadpeak-base-camp/
│   └── index.html                      → "K2 & Broad Peak" itinerary page
│                                          Opens as: yoursite.com/k2-broadpeak-base-camp/
│
├── gasherbrum-base-camp/
│   └── index.html                      → "Gasherbrum Base Camp" itinerary page
│                                          Opens as: yoursite.com/gasherbrum-base-camp/
│
├── gondogoro-la/
│   └── index.html                      → "Gondogoro La Crossing" itinerary page
│                                          Opens as: yoursite.com/gondogoro-la/
│
├── trango-towers/
│   └── index.html                      → "Trango Towers Base Camp" itinerary page
│                                          Opens as: yoursite.com/trango-towers/
│
├── deosai-plains/
│   └── index.html                      → "Deosai Plains" itinerary page
│                                          Opens as: yoursite.com/deosai-plains/
│
├── shigar-valley/
│   └── index.html                      → "Skardu & Shigar Valley" itinerary page
│                                          Opens as: yoursite.com/shigar-valley/
│
├── masherbrum-base-camp/
│   └── index.html                      → "Masherbrum (K1) Base Camp" itinerary page (Baltistan)
│                                          Opens as: yoursite.com/masherbrum-base-camp/
│
├── ogre-latok-base-camp/
│   └── index.html                      → "Ogre & Latok Base Camp" itinerary page (Baltistan)
│                                          Opens as: yoursite.com/ogre-latok-base-camp/
│
└── packing-list/
    └── index.html                      → Trek Packing List page
                                           Opens as: yoursite.com/packing-list/

WHY EVERY FOLDER HAS A FILE CALLED "index.html"
------------------------------------------------
This is intentional, not a mistake. Every web server automatically loads
a file named "index.html" when someone visits a folder URL — so a file
at "k2-base-camp/index.html" is what loads when a visitor goes to
"yoursite.com/k2-base-camp/" (no ".html" showing in the address bar).
That's the whole point of this folder structure — clean URLs.

Every "index.html" file is a DIFFERENT page — check the folder name
it's sitting inside to know which page it is. The one at the very top
level (not inside any folder) is your homepage.

WHAT CHANGED IN THIS UPDATE
-----------------------------
terms.html moved into its own folder (terms/index.html), same as the
itinerary pages, so it also gets a clean URL: yoursite.com/terms/

The Terms & Cancellation Policy content itself was also rewritten with
concrete, real-world policy instead of "TBD" placeholders:
  1. Deposit — 30% for shorter treks, 50% for multi-week expeditions
  2. Cancellation timeline — 30 / 15 / 7 day refund bands
  3. High-altitude & evacuation — client is responsible for arranging
     their own helicopter evacuation insurance; we don't provide it
  4. Force majeure & weather — we reschedule where possible, offer
     credit toward a future trek otherwise; no direct cash refunds for
     costs already committed to permits/jeeps/hotels
  5. Payment methods — Wise, international wire/SWIFT, Payoneer for
     the deposit; balance on arrival in Skardu (cash USD/EUR/GBP/PKR
     or bank transfer)

"Nanga Parbat Base Camp" and "Rakaposhi Base Camp" have been REMOVED
(they're in the Gilgit region, not Baltistan) and replaced with two
Baltistan-based expeditions:
  - Masherbrum (K1) Base Camp — 10 days, Hushe Valley
  - Ogre & Latok Base Camp — 12 days, Panmah Glacier via Askole
  If you already uploaded the old "nanga-parbat-base-camp" and
  "rakaposhi-base-camp" folders to your live server, delete those two
  folders manually — this zip only adds/updates files, it doesn't
  delete anything from your server automatically.

FIXED: the "K2 & Broad Peak" homepage card was showing the Gasherbrum
photo by mistake (a leftover bug from the very first version of this
site). It now points to its own file: tour-k2-broadpeak-base-camp.jpg
— see IMAGE-CHECKLIST.txt.

GALLERY REDESIGNED: instead of fixed filenames, the gallery now looks
for images/gallery/1.jpg, 2.jpg, 3.jpg ... up to 20.jpg. Just number
your photos and drop in as many (or as few) as you want — any number
that doesn't exist is automatically skipped, no code changes needed.
1.jpg is always shown as the large "featured" photo. Only the first 5
that exist show by default; the rest sit behind "View more photos".

SEO ADDED to all 12 public pages:
  - Optimised, keyword-rich <title> and meta description on every page
    (targeting "K2 base camp trek", "Baltistan treks", "Askole trek",
    "Great Adventure Tours", etc.)
  - Open Graph + Twitter Card tags (controls how the site looks when
    shared on WhatsApp/Facebook/Instagram/Twitter)
  - JSON-LD structured data — a TravelAgency profile on the homepage
    and a TouristTrip/price listing on every itinerary page, read by
    Google to build rich search results
  - robots.txt and sitemap.xml added at the root (see below)

⚠️ IMPORTANT — REPLACE THE PLACEHOLDER DOMAIN:
All of the above uses "https://greatadv.com" as a placeholder for your
real website address, in: every page's <link rel="canonical">, every
og:url / og:image / twitter:image tag, every JSON-LD block, robots.txt,
and sitemap.xml. Once you know your final domain, these need a
find-and-replace from "greatadv.com" to your real domain — tell me the
domain and I'll do this for you.

Google Analytics (GA4) tracking has also been added to every public
page (measurement ID G-THKGXD76FD) — nothing you need to do, it's
already wired in.

admin.html and SETUP-GUIDE.md ARE INCLUDED
--------------------------------------------
admin.html (your offer banner / reviews / enquiries manager) sits at
the root, next to index.html — same as before. It has been restyled to
match the site's actual brand (fonts, colours) but the Supabase
connection, table names and all logic are untouched — it still talks
to the exact same database as before.

SETUP-GUIDE.md is a new file admin.html has always referred to but
which was missing. It documents the Supabase tables, security
policies and admin login setup behind the whole system — keep it
somewhere safe (it doesn't need to be uploaded to your live site).
