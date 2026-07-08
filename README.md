# YouTube Chapter Checklist

A React app that loads **YouTube video chapters** from a URL and turns them into an **editable checklist**. Check sections off as you watch, rename items, reorder, add custom sections, or reset to the original chapters.

## Features

- Paste any YouTube watch, embed, short, or `youtu.be` link
- Automatically imports official chapter markers from the video
- Editable checklist: complete, rename, reorder, add, delete
- Timestamps link to the correct moment on YouTube
- Progress is saved in your browser (`sessionStorage`) per video for the current tab session

## Requirements

- Node.js 20+

## Run locally

```bash
cd youtube-chapter-checklist
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev script starts:

- **Web** (Vite) on port 5173
- **API** (Express) on port 3001 — proxies `/api` from the frontend

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + frontend together |
| `npm run build` | Production build for the frontend |
| `npm run start` | Run API only (after `npm run build` if serving static files) |

## Notes

- Only videos **with chapters** (creator-defined or auto-generated markers on YouTube) will load. If a video has no chapters, you’ll see an error message.
- Chapter data is fetched server-side via YouTube’s InnerTube API (`youtubei.js`) because browsers cannot call YouTube directly.

## Example videos with chapters

- [But what is a neural network?](https://www.youtube.com/watch?v=aircAruvnKk)
- Any long tutorial or podcast that shows chapters in the YouTube progress bar

## Deploy to Vercel

Vercel hosts the **frontend and API together** in one project. Checklist progress stays in the browser (`sessionStorage`) — nothing is stored on the server.

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import the project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project** and import this repository.
3. Vercel should auto-detect **Vite**. Leave defaults:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. **Environment variables:** none required for a same-origin deploy (`VITE_API_BASE_URL` can stay unset).
5. Click **Deploy**.

Your app will be live at `https://your-project.vercel.app`. The `/api/chapters` and `/api/health` routes are served as serverless functions from the `api/` folder.

### 3. Redeploy after changes

Push to `main` — Vercel redeploys automatically if the repo is connected.

### Deploy from the CLI (optional)

```bash
npm i -g vercel
vercel login
vercel          # preview deploy
vercel --prod   # production deploy
```

## Deploy to GitHub Pages

GitHub Pages only hosts **static files**. The chapter-fetching API must run on another host (free options: [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io)).

### 1. Host the API

On Render (example):

1. Push this repo to GitHub.
2. Create a **Web Service** connected to the repo.
3. **Root directory:** leave default.
4. **Build command:** `npm install`
5. **Start command:** `npm run start`
6. Copy the service URL (e.g. `https://youtube-chapter-checklist.onrender.com`).

Ensure CORS is already enabled in `server/index.ts` (it is).

### 2. Configure GitHub

In the repo on GitHub:

1. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_API_BASE_URL`
   - Value: your API URL with **no trailing slash** (e.g. `https://youtube-chapter-checklist.onrender.com`)

2. **Settings → Pages → Build and deployment**
   - Source: **GitHub Actions**

### 3. Push to `main`

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

The workflow in `.github/workflows/deploy-pages.yml` builds the app and deploys it.

Your site will be at:

`https://YOUR_USER.github.io/YOUR_REPO/`

(If the repo is named `YOUR_USER.github.io`, set `VITE_BASE_PATH` to `/` in the workflow instead of `/${{ github.event.repository.name }}/`.)

### Local production build (optional)

```bash
VITE_BASE_PATH=/youtube-chapter-checklist/ \
VITE_API_BASE_URL=https://your-api.onrender.com \
npm run build
npx vite preview
```
