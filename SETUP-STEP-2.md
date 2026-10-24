# Setup, Step 2: put the shop on the internet (about 40 minutes)

Cost: R0. No credit card and no domain needed. You will use two free accounts: GitHub (stores the project) and Netlify (runs the website).
Screens change over time, so if a button has a slightly different name, tell me what you see.

## A. Get the project onto your computer
1. Download `little-lab-learning-project.zip` from this chat.
2. Unzip it (right-click, then Extract All, or double-click on a Mac). You get a folder with files like `package.json` inside.

## B. Put it on GitHub
1. Go to **github.com** and sign up (free).
2. Click **New repository**. Name it `little-lab-learning`. Choose **Private**. Click **Create repository**.
3. On the next page, click the link **uploading an existing file**.
4. Open your unzipped folder. Select everything INSIDE it (not the folder itself) and drag it into the GitHub page. Wait until all files finish uploading.
5. Scroll down and click **Commit changes**.
6. Check: your repository should list `app`, `lib`, `supabase`, `package.json` and more.

## C. Copy two values from Supabase
1. Open your Supabase project, then **Project Settings**, then **API** (or click the green **Connect** button at the top).
2. Copy the **Project URL**.
3. Copy the key called **anon** or **publishable**. This one is meant to be used by websites.
4. Do NOT copy anything called **service_role** or **secret**.
Paste both somewhere safe for the next step, such as a notes app.

## D. Put it online with Netlify
1. Go to **netlify.com** and sign up with your GitHub account (free plan, no card).
2. Click **Add new project**, then **Import an existing project**, then **GitHub**, and choose `little-lab-learning`.
3. Netlify should detect **Next.js** by itself. Leave the other settings alone.
4. Open **Environment variables** (sometimes under Advanced) and add these two:
   - Name `NEXT_PUBLIC_SUPABASE_URL`, value: your Project URL
   - Name `NEXT_PUBLIC_SUPABASE_ANON_KEY`, value: your anon / publishable key
5. Click **Deploy** and wait a few minutes.

## E. Try it
1. Netlify gives you a web address ending in `.netlify.app`. Open it. You should see the shop home page. It will say new resources are coming soon, because the shop is empty.
2. Add `/admin/login` to the end of the address and log in with your admin email and password.
3. Click **Add a product**, fill it in, and save. Then click the product and look at its page.

## F. Tell me
- Whether the home page appeared, and whether login worked.
- If the deploy failed: open the failed deploy in Netlify, copy the red error lines from the log, and send them to me.
- A first error is likely and normal, since this is the first real run. I will fix it with you.

## Please know
- File uploads will not work yet. They need the private file storage, which is Step 3.
- Do not make real sales or share the address publicly. Payments are not connected.
- Never share your passwords or any secret key.
