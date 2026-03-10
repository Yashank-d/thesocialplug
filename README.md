# thesocialplug.

> irl > scrolling

Event management platform for **thesocialplug.** — a Bangalore-based offline social community built around the idea that real life beats the feed.

Live → [thesocialplug.vercel.app](https://thesocialplug.vercel.app)

---

## what it does

- Public event listing and booking with QR ticket generation
- Waitlist management with auto-promotion when spots open
- Email confirmations via Gmail SMTP (booking, waitlist, promotion)
- Admin dashboard — events, attendees, bookings
- QR code check-in (manual list + camera scanner)
- Team access with role-based permissions (admin / team)
- Team invite flow via Supabase Auth
- Attendee database with notes, search, CSV export
- Manual booking by admin (bypasses capacity)

---

## stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | Supabase Auth |
| Database | Supabase Postgres + Prisma 7 |
| Email | Nodemailer + Gmail SMTP |
| QR | qrcode.react + html5-qrcode |
| Deployment | Vercel |

---

## design

- **#0D0D0D** — dark background
- **#C6FF00** — acid green accent
- **#EDEDED** — light text
- **Inter** — UI font
- **Playfair Display** — display/headings
- Glass panels, animated orbs, uppercase tracking

---

## local setup
```bash
git clone https://github.com/Yashank-d/thesocialplug
cd thesocialplug
npm install
```

Create `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
GMAIL_USER=
GMAIL_APP_PASSWORD=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
```bash
npx prisma generate
npm run dev
```

---

## roles

**admin** — full access: events, attendees, team, bookings, check-in

**team** — check-in only (manual list + QR scan)

---

## project structure
```
src/
├── app/
│   ├── admin/          # dashboard, events, attendees, team
│   ├── api/            # bookings, events, attendees, team routes
│   ├── auth/           # supabase callback handler
│   ├── events/         # public booking pages
│   └── login/          # auth
├── components/
│   ├── admin/          # nav, check-in, forms, controls
│   └── public/         # booking form + ticket
└── lib/                # prisma, supabase, auth helpers
```

---

## made for

**thesocialplug.** · bangalore · irl > scrolling
