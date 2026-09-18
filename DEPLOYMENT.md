# 🌐 BCAlgorix — 1-Click Online Hosting Guide

Deploy your **BCAlgorix Blind Typing Championship** web application online so anyone across the internet can access it from their laptops, tablets, or phones.

---

## ⚡ Recommended: Deploy Free on Render.com (Permanent & Free HTTPS)

[Render.com](https://render.com) is 100% free and hosts full-stack Node.js + React applications with a custom public URL (e.g. `https://bcalgorix.onrender.com`).

### Step 1: Initialize Git and Push to GitHub

1. Open your terminal in the project directory (`blind type`) and run:
   ```bash
   git init
   git add .
   git commit -m "BCAlgorix Blind Typing Championship initial release"
   ```
2. Go to [GitHub](https://github.com) and create a **New Repository** (named `bcalgorix` or `blind-typing`).
3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bcalgorix.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy on Render

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in with GitHub.
2. Click **New +** and select **Web Service**.
3. Select your `bcalgorix` repository.
4. Fill in the deployment details:
   - **Name**: `bcalgorix` *(or your chosen name)*
   - **Region**: Closest to your contestants (e.g., Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank / default)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Under **Environment Variables**, click **Add Environment Variable** and add these:
   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://rakeshgolivi4_db_user:YDikN9YWm4aGiFS8@cluster0.cavaxf8.mongodb.net/bcalgorix?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | `bcalgorix_super_secret_jwt_key_2026` |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | `admin@bcalgorix2026` |

6. Click **Create Web Service**!

Render will automatically install dependencies, build your React frontend, connect to your MongoDB Atlas cluster, and give you a live public URL:
👉 **`https://bcalgorix.onrender.com`**

---

## 🚀 Alternative: Instant Public Link Right Now (Using Localtunnel or Cloudflare)

If you want an immediate live link right this minute to test from your phone or share with your team while your laptop is running:

Run in PowerShell:
```bash
npx localtunnel --port 5000
```
This gives you an instant public URL like:
👉 `https://bcalgorix-fest.loca.lt`
*(Anyone in the world can open that URL and access your live app!)*
