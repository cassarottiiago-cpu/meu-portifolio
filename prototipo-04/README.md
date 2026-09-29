# Iago Cassarotti — Creative Developer

Site estático (pt na raiz, en em /en/). Conteúdo em `data/`, páginas geradas por `scripts/gerar.cjs`.

```text
npm install
npm run dev      # http://127.0.0.1:4177
npm run build    # dist/ pronto para publicar (Vercel: Root Directory = prototipo-04)
npm test         # bateria de testes (Edge + axe)
npm run imagens  # regenera assets/img a partir das capturas
npm run og       # regenera assets/og
```

Publicação: defina `url` em `data/site.cjs` (ou `SITE_URL`) para canonical, sitemap e prévias. Fontes locais em WOFF2 com licenças em `creditos`.
