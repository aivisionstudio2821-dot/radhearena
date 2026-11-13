# RadheArena Premium

A fresh Radhe Box Cricket 2.0 React/Vite project.

## Includes

- Cinematic bat + cricket-ball intro
- Scroll-linked cricket ball
- Premium Midnight Violet / Neon Yellow visual system
- Responsive public website
- Single + Double Slot booking
- Day/Night pricing
- Supabase production booking RPC
- Blocked-slot support
- Admin command center
- Booking approval/rejection
- Secret Cricket Mode
- WhatsApp confirmation flow
- SEO basics

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Supabase URL and publishable key to `.env`.

Then run `supabase/schema.sql` in the Supabase SQL editor.

For the admin dashboard, create an Auth user in Supabase Authentication and add that user's UUID to `public.admin_users`.

## Pricing

06:00–17:00: ₹800/hour
17:00–00:00: ₹1100/hour

Double sessions automatically calculate each hour's applicable rate.

## Important

Never put a Supabase service-role/secret key in the frontend.
