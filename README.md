# Jyxdi — sketchbook concept

An unofficial website concept for [Jyxdi](https://jyxdi.com): a sketchbook-style storefront for her
original paintings, prints and UV-reactive canvases. Artwork and photography © Jyxdi.

- Home, Shop (36 works), a page per painting, The Artist, Commissions, Spirit Gates, FAQ
- Cart hands off to the real Shopify checkout on jyxdi.com via cart permalinks
- Commission briefs post to the store's own contact form

Built with Next.js 16, React 19, Tailwind 4, GSAP, Motion and components from [React Bits](https://reactbits.dev).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
