# Setup, Step 1: your database (about 20 minutes)

This step costs nothing and needs no domain. You will create the free "filing cabinet" and make yourself the admin.
Screens change over time, so if a button has a slightly different name, tell me what you see.

## A. Create your account and project
1. Go to **supabase.com** and choose **Start your project**. Sign up with your email (or GitHub if you have it).
2. Choose **New project**.
3. Name it `little-lab-learning`.
4. Make up a **database password**. Save it in a safe place (a password manager or a notebook). You will rarely need it, but you cannot see it again.
5. For **region**, choose the closest one to South Africa that is offered. Tell me which regions you see.
6. Choose the **Free** plan and create the project. Wait a couple of minutes until it says it is ready.

## B. Build the filing cabinet
1. In the left menu, open **SQL Editor** and start a **new query**.
2. Open the file `supabase/schema.sql` from this project, select everything, and copy it.
3. Paste it into the SQL Editor and press **Run**.
4. It should say "Success". **If you see a red error, copy the whole message and send it to me. Do not try to fix it yourself.**

## C. Make yourself the admin
1. In the left menu, open **Authentication**, then **Users**, then **Add user**.
2. Enter your email and a strong password. Tick the option to **auto-confirm** the user.
3. Go back to **SQL Editor**, start a new query, paste the line below with your own email, and press **Run**:

```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR-EMAIL-HERE');
```

4. It should say that 1 row was updated. If it says 0, the email does not match. Check for typos.

## D. Check it worked
Open **Table Editor** in the left menu. You should see tables called products, orders, reviews, faqs and more. Open `profiles`: you should see one row with the role **admin**.

## E. Tell me
Send me:
- Whether A to D worked, and any error messages.
- Which regions were offered.

## Never share these
Your database password, your login password, and any key marked "secret" or "service role". I will never ask you to paste them into a chat.

## What comes next
Step 2 is getting the shop onto the internet so you can use the admin area from your browser. I will write that guide after Step 1 is confirmed.
