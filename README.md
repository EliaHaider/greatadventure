# Great Adventure — Website Files

## ⚠️ Zaroori: Pehle Poori Zip Extract Karein

1. Is zip file ko **poora extract/unzip** karein (right-click → Extract All)
2. Ek folder banega `great-adventure-website` naam ka — **usko waisa hi rehne dein**, andar ki files ko idhar-udhar move na karein
3. Us folder ke andar `index.html` ko **double-click** karke kholein

Agar aap sirf `index.html` ko akela nikaal kar kahin aur move kar denge (bina baaki folders ke), to design (CSS) aur menu (JS) kaam nahi karega — kyun ke website in files ko **saath rakhne** ki zaroorat hoti hai:

```
great-adventure-website/
├── index.html                  ← Home page
├── k2-base-camp.html           ← Tour itinerary pages
├── deosai-plains.html
├── gasherbrum-base-camp.html
├── trango-towers.html
├── shigar-valley.html
├── gondogoro-la.html
├── admin.html                  ← Password-protected offer manager
├── css/
│   └── style.css               ← All website styling
├── js/
│   └── main.js                 ← Hamburger menu + offer banner
├── images/
│   ├── logo/
│   │   └── logo.png            ← Already added ✓
│   ├── tours/                  ← 7 tour photos yahan daalein
│   ├── gallery/                ← 5 gallery photos yahan daalein
│   ├── team/                   ← 4 team photos yahan daalein
│   ├── news/                   ← 3 news photos yahan daalein (optional)
│   └── testimonials/           ← 3 reviewer photos (optional)
└── docs/
    ├── NEEDED-INFO.md          ← Kya kya info abhi missing hai
    ├── SETUP-GUIDE.md          ← Admin panel kaise setup karein
    └── IMAGE-GUIDE.md          ← Har photo ka naam aur folder (poora reference)
```

## Photos Add Karna

Har `images/` ke sub-folder ke andar ek `READ-ME-naming.txt` file hai jisme bataya hai us folder mein kaunsi photo, kis naam se save karni hai. Bas photo ko exact usi naam se us folder mein daal dein — website khud usko dikha degi (ek dafa main HTML mein `<img>` tags add kar dun, jo main karunga jaise hi photos mil jayen).

## Deploy Karne Ke Liye (Live Website Banane Ke Liye)

Jab live karna ho, to yehi poora `great-adventure-website` folder **Netlify** ya **Vercel** par drag-and-drop kar dein — sab kuch waise hi kaam karega jaise local mein karta hai, kyun ke folder structure bilkul same rahega.

## Kuch Kaam Nahi Kar Raha?

Agar CSS/design load nahi ho raha:
- Confirm karein ke `css` aur `js` folders `index.html` ke **bilkul sath** (same level) hain
- Kisi file ko individually doosri jagah move na karein
- Zip se poora extract karein, sirf preview na karein
