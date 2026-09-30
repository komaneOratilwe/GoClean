# GoClean
Laundry Pickup and Delivery Service Web Application

## Tech Stack

- **Frontend**: Plain HTML, CSS, and JavaScript (no framework)
- **Backend**: Vercel Serverless Functions (in the `/api` folder) - Node.js
- **Database**: Supabase (Postgres)
- **Email**: Resend (for password reset emails)
- **Hosting**: Vercel

This project originally used Express + MySQL, running locally. It's since been
migrated to run fully on Vercel + Supabase, so it can be deployed live rather
than only running on one person's computer.

## Local Setup (for teammates)

1. Clone this repo.
2. Run `npm install`.
3. Ask a teammate who already has it working for the `.env` values (never
   committed to this repo, for security) and create your own `.env` file in
   the project root with:
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   RESEND_API_KEY=...
   SITE_URL=http://localhost:3000
   ```
4. Install the Vercel CLI if you don't have it: `npm install -g vercel`
5. Run `vercel dev` to start the local server at `http://localhost:3000`.

## Deploying

Deployment happens automatically when this repo's `main` branch is pushed to,
once Vercel's Git integration is connected. Until then, deploying live requires
running `vercel --prod` manually from a terminal.

**Important**: editing files locally does *not* update the live site by
itself - either a `git push` (with Vercel's Git integration connected) or a
manual `vercel --prod` is required every time.

## What's Done

- Signup and login with real password hashing (bcrypt), backed by Supabase
- Row Level Security enabled on the database - only the backend (using a
  private service_role key) can read or write data directly
- Login rate limiting: 5 failed attempts locks an account for 15 minutes
- Real password reset flow: emailed via Resend, with a real expiring token
- Placing an order, viewing order history (My Orders), and tracking a single
  order (Track Order) - all reading and writing real data
- Order ownership checks: a user can only view or cancel their own orders
- Cancelling a still-pending order
- Editable profile (name, phone, pickup address, delivery instructions),
  loaded from and saved to the database

## What's Still Missing / Open for Teammates

- **Admin/staff page**: nothing currently moves an order past "Pending" -
  there's no way yet for the business side to mark an order as picked up,
  washing, ready, out for delivery, or delivered. This is what would make
  the Track Order timeline actually reflect something real.
- **Real notifications**: the bell icon in the header is currently just
  decorative - it doesn't show a real count or real updates when an order's
  status changes.
- **Payment step**: the About page mentions "Secure Payments" as a feature,
  but there's currently no payment step in the order flow at all - it just
  places the order directly. This would need a mock/placeholder screen at
  minimum, since a real payment processor is a bigger undertaking.
- **Email verification on signup**: anyone can currently sign up with any
  email address, real or not - nothing confirms it belongs to them.

## Database Tables (Supabase)

- **users**: id, full_name, email, phone, password_hash, pickup_address,
  special_instructions, created_at, failed_login_attempts, locked_until,
  reset_token, reset_token_expires
- **orders**: id, order_number, user_id, service, status, order_date,
  pickup_date, pickup_time, pickup_address, delivery_address,
  special_instructions, quantity, total, picked_up_at, washing_at, ready_at,
  out_for_delivery_at, delivered_at, delivery_date, delivery_time
