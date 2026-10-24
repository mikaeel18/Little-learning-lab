# Little Lab Learning: project guide

## Where we are
- Done: the storefront look and feel (the page you approved).
- Done: the database design in `supabase/schema.sql` (the "filing cabinet" for products, orders, customers and reviews, with privacy rules built in). It has not been run against a real database yet.
- Next, in this order: admin area, customer accounts, checkout, payments (test mode first), secure file delivery, emails.

## Nothing for you to do yet
When the admin area is written, I will give you numbered steps for each account, one at a time. Free accounts will be: GitHub, Supabase, Cloudflare. Paystack starts in test mode. Your only purchase will be a domain name.

## Keep secrets secret
The file `.env.example` lists the passwords and keys the shop needs. You will copy it to a file called `.env.local` and fill it in. Never share `.env.local`, never upload it to GitHub, and never paste its contents into a chat.

## Not tested yet
Payments, file delivery and emails have not been run against real services. I will tell you plainly when each one has been tested.
