# Deployment Guide

## Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variable in Vercel dashboard:
   - Go to your project settings
   - Add `GEMINI_API_KEY` with your API key

## Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Set environment variable:
```bash
netlify env:set GEMINI_API_KEY your_api_key_here
```

## Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

3. Update `vite.config.ts` with base path:
```typescript
export default defineConfig({
  base: '/InvoiceSnap/',
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

## Docker Deployment

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

2. Build and run:
```bash
docker build -t invoicesnap .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key invoicesnap
```

## Environment Variables

Remember to set `GEMINI_API_KEY` in your deployment platform!
