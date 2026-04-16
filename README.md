# Paige Fullerton · Spokane Real Estate — Static Site

Single-agent marketing site for **Paige Fullerton**, real estate agent with eXp Realty in Spokane, WA. Built for **AWS S3 static hosting** with strong SEO and AEO (answer-engine) foundations.

## What's Inside

```
paige-fullerton-site/
├── index.html           # Homepage (hero, path picker, featured listings, neighborhoods, testimonials, FAQ, intake)
├── buyers.html          # Buyer journey + buyer intake form
├── sellers.html         # Seller marketing plan + free home valuation form
├── listings.html        # Active + recently-sold listings
├── about.html           # Meet Paige
├── contact.html         # Contact + intake form
├── 404.html             # Not-found page
├── robots.txt           # Crawler policy (opens door to GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
├── sitemap.xml          # XML sitemap
├── css/styles.css       # Single-file design system
├── js/main.js           # Nav, scroll reveal, form handler, URL param prefill
└── assets/
    ├── favicon.svg      # Branded SVG favicon
    └── images/          # Drop Paige's headshot + listing photos here
```

## SEO / AEO Features

- **Structured data (JSON-LD)**: RealEstateAgent, LocalBusiness, WebSite, Person, Service, ContactPage, BreadcrumbList, FAQPage
- **FAQ schema** on homepage, buyers, and sellers — positions the site to be cited by Google AI Overviews, Perplexity, and ChatGPT
- **Canonical URLs** + Open Graph + Twitter cards on every page
- **Semantic HTML5** (header, main, section, article, aside, footer) for crawler clarity
- **Location keywords** baked into titles, H1s, meta descriptions, alt text
- **robots.txt** explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot)
- **Mobile-first responsive** layout, system-font fallbacks, minimal render-blocking CSS
- **Core Web Vitals-friendly**: no frameworks, deferred JS, preconnects to Google Fonts
- **Human-readable FAQ accordions** mirror the JSON-LD so search engines verify answers against visible content

## Before Going Live — Customization Checklist

### Must fill in before launch (intentional placeholders)

1. **Phone number** — every visible phone and `tel:` link uses the placeholder `(509) 401-8055` / `+15094018055`. Run:
   ```bash
   grep -rl "509) XXX-XXXX" . | xargs sed -i '' 's|(509) 401-8055|(509) 555-1234|g'
   grep -rl "1509XXXXXXX" . | xargs sed -i '' 's|+15094018055|+15095551234|g'
   ```
   Also update the JSON-LD telephone field (`+1-509-401-8055` → `+1-509-555-1234`) in `index.html`, `contact.html`, and `sellers.html`.
2. **Email** — currently `hello@paigefullerton.realtor` everywhere. Replace with her working email (eXp routes email through `paige.fullerton@exprealty.com` by default for most agents).
3. **Headshot** — drop Paige's real headshot into `/assets/images/paige-headshot.jpg` and update the `.about-photo` `background-image` URL in `index.html` and `about.html` (currently Unsplash). Instagram handle for reference: [@paigefullerton.realtor](https://www.instagram.com/paigefullerton.realtor/).
4. **Open Graph cover** — save a branded hero image at `/assets/images/og-cover.jpg` (1200×630 px).
5. **Active listings** — `listings.html` currently shows neighborhood tiles (no fabricated addresses). To add real listings, clone the listing-card pattern on the homepage or wire up an IDX provider (iHomefinder, Showcase IDX, Spark API). Her verified closings live on her [Realtor.com profile](https://www.realtor.com/realestateagents/69431c8e93b775f14935ef89).
6. **Reviews** — homepage links out to real reviews on [Yelp](https://www.yelp.com/biz/paige-fullerton-realtor-spokane) and [Realtor.com](https://www.realtor.com/realestateagents/69431c8e93b775f14935ef89). If you want inline testimonials, quote actual published reviews with attribution.

### Technical setup

7. **Wire the intake form** — `js/main.js` looks for `data-endpoint="…"` on the `<form id="intake-form">`. Set it to Formspree, Netlify Forms, or (preferred) an SES-backed Lambda. Example:
   ```html
   <form id="intake-form" data-endpoint="https://api.paigefullerton.com/intake" novalidate>
   ```
8. **Domain** — replace every `https://paigefullerton.com/` with the final domain:
   ```bash
   grep -rl "paigefullerton.com" . | xargs sed -i '' 's|paigefullerton.com|yournewdomain.com|g'
   ```
9. **Legal** — add a privacy policy and Washington-required brokerage disclosure (agency pamphlet link). eXp Realty WA license details should appear in the footer per state rules.

### Verified identity (as wired)

- **Name:** Paige Fullerton
- **Title:** WA Realtor · The FI Team | eXp Brokerage (per her LinkedIn)
- **Team:** [The FI Team](https://www.facebook.com/thefiteamre/) — one of the fastest-growing real estate teams in North America, operating under eXp
- **Instagram:** [@paigefullerton.realtor](https://www.instagram.com/paigefullerton.realtor/)
- **Realtor.com:** [profile](https://www.realtor.com/realestateagents/69431c8e93b775f14935ef89)
- **Yelp:** [profile](https://www.yelp.com/biz/paige-fullerton-realtor-spokane)
- **Service area:** Spokane, Spokane Valley, Liberty Lake, Coeur d'Alene (North Idaho)

## Deploying to AWS S3 + CloudFront

### 1. Create the S3 bucket

```bash
BUCKET=paigefullerton.com
aws s3 mb s3://$BUCKET --region us-west-2
aws s3 website s3://$BUCKET --index-document index.html --error-document 404.html
```

### 2. Upload files

```bash
cd paige-fullerton-site
aws s3 sync . s3://$BUCKET --acl public-read \
  --exclude "README.md" --exclude ".DS_Store" \
  --cache-control "public,max-age=3600"

# Longer cache for static assets
aws s3 cp css/ s3://$BUCKET/css/ --recursive --acl public-read \
  --cache-control "public,max-age=604800,immutable"
aws s3 cp js/ s3://$BUCKET/js/ --recursive --acl public-read \
  --cache-control "public,max-age=604800,immutable"
aws s3 cp assets/ s3://$BUCKET/assets/ --recursive --acl public-read \
  --cache-control "public,max-age=2592000,immutable"
```

### 3. Put CloudFront in front (recommended)

- Origin: the S3 bucket's website endpoint
- Default root object: `index.html`
- Redirect HTTP → HTTPS
- Custom error response: 404 → `/404.html`
- Attach an ACM certificate for the custom domain
- Invalidate cache after each deploy: `aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"`

### 4. DNS

Point your A/AAAA records (or ALIAS) at the CloudFront distribution.

## Local Preview

```bash
cd paige-fullerton-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Performance Notes

- No build step. No framework. No npm.
- Google Fonts loaded async via `display=swap`.
- Scroll reveals use `IntersectionObserver` — zero layout thrash.
- All images use `background-image` with `auto=format&q=80` Unsplash params; swap to AVIF/WebP when using real photography.

## License

All copy, structure, and styling: © Paige Fullerton. Photography placeholders are Unsplash (free for commercial use) — replace with original work before launch.
