# Dent-O-Facial — Luxury Dermatology & Dental Clinic Website

**Dr. Hadi Raza | Purnea & Banmankhi, Bihar**

A production-ready Next.js 14 website with Tailwind CSS, Framer Motion animations, and Sanity CMS.

---

## 🗂️ Folder Structure

```
dent-o-facial/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Footer, Floating buttons)
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles + CSS variables
│   ├── about/page.tsx          # About Dr. Hadi Raza
│   ├── treatments/page.tsx     # All treatments (Dermatology + Dental)
│   ├── results/page.tsx        # Before/After gallery
│   ├── testimonials/page.tsx   # Patient testimonials
│   ├── blog/page.tsx           # Blog listing
│   └── contact/page.tsx        # Contact + Maps
├── components/
│   ├── sections/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HighlightsSection.tsx
│   │   ├── TreatmentsGrid.tsx
│   │   ├── DoctorSection.tsx
│   │   ├── TestimonialsCarousel.tsx
│   │   ├── LocationSection.tsx
│   │   └── CTASection.tsx
│   └── ui/
│       ├── FloatingButtons.tsx  # WhatsApp + Phone floating
│       ├── BeforeAfterSlider.tsx
│       └── StructuredData.tsx   # SEO schema markup
├── lib/
│   └── sanity.ts               # Sanity client + queries
├── sanity/
│   ├── index.ts                # Schema exports
│   └── schemas/
│       ├── doctor.ts
│       ├── treatment.ts
│       └── content.ts          # Testimonials, Blog, Gallery
├── public/                     # Static assets
├── .env.local.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary Background | `#F8F7F4` (Ivory) |
| Accent / Gold | `#D6B98C` (Champagne Gold) |
| Text | `#1C1C1C` (Charcoal) |
| Heading Font | Playfair Display |
| Body Font | Inter |

---

## 🚀 Local Setup

### Step 1: Clone and install

```bash
git clone https://github.com/yourusername/dent-o-facial.git
cd dent-o-facial
npm install
```

### Step 2: Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual Sanity project credentials.

### Step 3: Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Sanity CMS Setup

### Step 1: Create Sanity project

```bash
npm create sanity@latest
```

- Project name: `dent-o-facial-cms`
- Dataset: `production`
- Template: Clean project

### Step 2: Add schemas

Copy the schemas from `/sanity/schemas/` into your Sanity Studio project's `schemaTypes` folder.

### Step 3: Get your Project ID

From your Sanity dashboard at [sanity.io/manage](https://sanity.io/manage), copy your **Project ID** and paste into `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_id_here
```

### Step 4: Deploy Sanity Studio

```bash
cd your-sanity-studio-folder
npx sanity deploy
```

### Editable CMS Content
- Doctor profile, photo, bio, credentials
- All treatments (descriptions, steps, FAQs, images)
- Before/After gallery
- Patient testimonials + video links
- Blog posts with full rich text + SEO fields
- Clinic information

---

## ☁️ Deploying to Vercel

### Step 1: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit — Dent-O-Facial website"
git branch -M main
git remote add origin https://github.com/yourusername/dent-o-facial.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in
2. Click **"Add New Project"**
3. Import your GitHub repository: `dent-o-facial`
4. Framework Preset: **Next.js** (auto-detected)

### Step 3: Add Environment Variables in Vercel

In the Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Your Sanity API token |
| `NEXT_PUBLIC_SITE_URL` | `https://dentofacial.in` |

### Step 4: Deploy

Click **"Deploy"**. Vercel will build and deploy automatically.

Your site will be live at: `https://dent-o-facial.vercel.app`

---

## 🌐 Custom Domain Setup

### Step 1: Add domain in Vercel

1. Go to Vercel project → **Settings → Domains**
2. Add your domain: `dentofacial.in`
3. Vercel will show you DNS records to configure

### Step 2: Configure DNS

In your domain registrar (GoDaddy, Namecheap, etc.):

**Option A — Root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option B — www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: SSL Certificate

SSL is **automatically provisioned** by Vercel once your domain's DNS propagates (usually within 10–30 minutes). No manual setup required.

---

## 📱 Key Features

### WhatsApp Booking
All booking buttons link to: `https://wa.me/919876543210` with pre-filled messages. Update the number in `FloatingButtons.tsx`, `Navbar.tsx`, and `CTASection.tsx`.

### Phone Numbers to Update
Search the codebase for `+91 98765 43210` and `919876543210` — replace with Dr. Raza's actual number.

### Google Maps
Maps in `LocationSection.tsx` and `contact/page.tsx` use Google Maps embed iframes. Replace the `src` URLs with the actual clinic location embed URLs from [Google Maps](https://maps.google.com).

To get embed URL:
1. Search clinic address on Google Maps
2. Click Share → Embed a map
3. Copy the `src` from the iframe

---

## 🔍 SEO

### Target Keywords
- Dermatologist in Purnea
- Best dental clinic Banmankhi
- Skin specialist in Bihar
- Teeth whitening Purnea
- Acne treatment Purnea

### Schema Markup
`StructuredData.tsx` contains:
- `MedicalBusiness` schema for the clinic
- `Physician` schema for Dr. Hadi Raza
- LocalBusiness opening hours

Add the `<StructuredData />` component to `app/layout.tsx` within the `<head>` tag.

---

## 📸 Adding Real Images

1. Log into your Sanity Studio
2. Navigate to **Doctor Profile** → upload Dr. Raza's photo
3. Navigate to **Gallery** → upload before/after images
4. Navigate to **Treatments** → upload treatment images
5. Images will automatically appear on the website via Sanity's CDN

---

## 🛠️ Customization Checklist

- [ ] Replace phone number `+91 98765 43210` with real number
- [ ] Replace Google Maps embed URLs with real clinic locations
- [ ] Upload doctor photo via Sanity CMS
- [ ] Upload before/after gallery images via Sanity CMS
- [ ] Add real patient testimonials via Sanity CMS
- [ ] Write and publish blog posts via Sanity CMS
- [ ] Configure WhatsApp number in FloatingButtons.tsx
- [ ] Add Instagram URL in Footer.tsx
- [ ] Update clinic addresses with exact locations
- [ ] Add StructuredData component to layout.tsx
- [ ] Set up Sanity project and add credentials to .env.local
- [ ] Deploy to Vercel and connect custom domain
- [ ] Activate Google Analytics (optional)

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations (ready to integrate) |
| Sanity CMS | Content management |
| Vercel | Hosting + CDN + SSL |
| Lucide React | Icons |

---

## 📞 Support

Built for Dr. Hadi Raza — Dent-O-Facial, Purnea & Banmankhi, Bihar.
