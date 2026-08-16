// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // ? ≈÷«·… Sitemap Generator
    {
      name: 'sitemap',
      apply: 'build',
      generateBundle() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://download.madartech.uk/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://download.madartech.uk/analyze</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: sitemap
        })
      }
    }
  ]
})