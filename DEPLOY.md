# 🚀 VaultGuard — Deployment Guide

Step-by-step instructions for deploying the Password Manager to **Render** (backend), **Vercel** (frontend), and **MongoDB Atlas** (database).

---

## Table of Contents

1. [MongoDB Atlas](#1-mongodb-atlas)
2. [Deploy Backend to Render](#2-deploy-backend-to-render)
3. [Deploy Frontend to Vercel](#3-deploy-frontend-to-vercel)
4. [Update CORS](#4-update-cors)
5. [Update Google OAuth](#5-update-google-oauth)
6. [Verify Deployment](#6-verify-deployment)

---

## 1. MongoDB Atlas

### Create a Free Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and sign up / log in.
2. Click **"Build a Database"** → choose **M0 Free Tier**.
3. Select a cloud provider and region close to your Render server.
4. Click **"Create Cluster"**.

### Create a Database User

1. Go to **Security → Database Access → Add New Database User**.
2. Choose **Password** authentication.
3. Set a strong username and password (save these — you'll need them for `MONGO_URI`).
4. Grant **Read and Write to any database** permissions.

### Whitelist IPs

1. Go to **Security → Network Access → Add IP Address**.
2. Click **"Allow Access from Anywhere"** → enter `0.0.0.0/0`.
   > ⚠️ Render uses dynamic IP addresses, so whitelisting `0.0.0.0/0` is required.
   > In production, consider using Render's private networking or a VPN for tighter control.

### Get the Connection String

1. Go to **Databases → Connect → Drivers**.
2. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
3. Replace `<username>`, `<password>`, and `<dbname>` with your values.

---

## 2. Deploy Backend to Render

### Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New → Web Service**.
2. Connect your GitHub repository.
3. Configure:

| Setting           | Value                |
| ----------------- | -------------------- |
| **Name**          | `vaultguard-api`     |
| **Root Directory**| `Backend`            |
| **Runtime**       | `Node`               |
| **Build Command** | `npm install`        |
| **Start Command** | `node server.js`     |

### Environment Variables

Add all of the following in **Render → Environment → Environment Variables**:

| Variable              | Description                                                                  | Example                                        |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `PORT`                | Port for Express (Render sets this automatically, but add as fallback)       | `5000`                                         |
| `NODE_ENV`            | Must be `production`                                                         | `production`                                   |
| `MONGO_URI`           | MongoDB Atlas connection string                                              | `mongodb+srv://user:pass@cluster0.xxx.net/vault`|
| `JWT_SECRET`          | Random 128-char hex string for signing JWTs                                  | *(run: `node -e "..."` — see below)*           |
| `JWT_EXPIRES_IN`      | Token expiry duration                                                        | `7d`                                           |
| `ENCRYPTION_KEY`      | Random 64-char hex string (32 bytes) for AES-256-CBC                         | *(run: `node -e "..."` — see below)*           |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID from Cloud Console                                    | `xxxx.apps.googleusercontent.com`              |
| `GOOGLE_CLIENT_SECRET`| Google OAuth client secret                                                   | `GOCSPX-xxxx`                                  |
| `GOOGLE_CALLBACK_URL` | Full callback URL (must match Google Console)                                | `https://vaultguard-api.onrender.com/api/auth/google/callback` |
| `CLIENT_URL`          | Deployed frontend URL (for CORS)                                             | `https://vaultguard.vercel.app`                |
| `FRONTEND_URL`        | Deployed frontend URL (for OAuth redirects)                                  | `https://vaultguard.vercel.app`                |

**Generate secrets locally:**

```bash
# JWT_SECRET (128 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Health Check

- Set the **Health Check Path** on Render to: `/api/health`
- Render will ping this endpoint to confirm the service is alive.

---

## 3. Deploy Frontend to Vercel

### Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New → Project**.
2. Import your GitHub repository.
3. Configure:

| Setting              | Value              |
| -------------------- | ------------------ |
| **Root Directory**   | `Frontend`         |
| **Framework Preset** | `Vite`             |
| **Build Command**    | `npm run build`    |
| **Output Directory** | `dist`             |

### Environment Variables

Add the following in **Vercel → Settings → Environment Variables**:

| Variable        | Value                                        |
| --------------- | -------------------------------------------- |
| `VITE_API_URL`  | `https://vaultguard-api.onrender.com`        |

> ⚠️ Do **not** add a trailing slash to the URL.

### Client-Side Routing

Vite SPAs need all routes to serve `index.html`. Create this file in `Frontend/`:

**`Frontend/vercel.json`**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> This ensures routes like `/dashboard`, `/login`, etc. work correctly on page refresh.

---

## 4. Update CORS

After deployment, update the backend's `CLIENT_URL` environment variable on Render to match your **actual Vercel URL**:

```
CLIENT_URL=https://vaultguard.vercel.app
FRONTEND_URL=https://vaultguard.vercel.app
```

Both values should be the same — `CLIENT_URL` controls CORS, `FRONTEND_URL` controls OAuth redirects.

> 💡 If you later add a custom domain to Vercel, update these values accordingly.

---

## 5. Update Google OAuth

### Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Open your OAuth 2.0 Client ID.
3. Add the following:

**Authorised JavaScript origins (add both):**
```
https://vaultguard.vercel.app
https://vaultguard-api.onrender.com
```

**Authorised redirect URIs (add):**
```
https://vaultguard-api.onrender.com/api/auth/google/callback
```

4. Click **Save**.

> ⚠️ Changes may take up to 5 minutes to propagate. If you get a `redirect_uri_mismatch` error, wait and try again.

---

## 6. Verify Deployment

### Backend

```bash
curl https://vaultguard-api.onrender.com/api/health
# Expected: {"status":"ok"}
```

### Frontend

1. Open `https://vaultguard.vercel.app` in a browser.
2. Register a new account.
3. Log in → add a password entry → verify it appears in the vault.
4. Test Google OAuth login.
5. Test password copy, edit, and delete.

### Checklist

- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Registration creates a new user
- [ ] Login returns a JWT and redirects to dashboard
- [ ] Google OAuth flow completes successfully
- [ ] Password entries are created, listed, and decrypted
- [ ] Edit and delete operations work
- [ ] Copy-to-clipboard works
- [ ] CORS errors are absent (check browser DevTools → Network)
- [ ] No secrets are visible in the frontend bundle

---

## Troubleshooting

| Problem                        | Solution                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| `CORS error` in browser        | Verify `CLIENT_URL` on Render matches the exact Vercel domain            |
| `redirect_uri_mismatch`        | Verify `GOOGLE_CALLBACK_URL` matches what's in Google Cloud Console      |
| `MongoDB connection failed`    | Check `MONGO_URI` is correct; verify Atlas IP whitelist includes 0.0.0.0 |
| `Cannot GET /dashboard`        | Add `vercel.json` with rewrites (see Section 3)                          |
| `401 Unauthorized` everywhere  | Check `JWT_SECRET` is set in Render env vars                             |
| Decryption errors              | `ENCRYPTION_KEY` must match the key used when data was stored            |
