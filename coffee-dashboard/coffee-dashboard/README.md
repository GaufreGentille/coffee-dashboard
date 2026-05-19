# ☕ Specialty Coffee Daily

Dashboard quotidien du café de spécialité — marchés, actualités, science, Instagram & Reddit.

## Stack
- React + Vite (frontend)
- Netlify Functions (backend sécurisé — clés API jamais exposées)
- Claude API (génération du contenu)
- Alpha Vantage (cours EUR/USD et BRL/USD en temps réel)

## Variables d'environnement à configurer sur Netlify
```
ANTHROPIC_API_KEY=sk-ant-...
ALPHA_VANTAGE_KEY=...
```

## Structure
```
netlify/functions/
  get-news.js      → appelle Claude API (news + science + reddit)
  get-markets.js   → appelle Alpha Vantage (forex)
src/
  App.jsx          → dashboard React
  main.jsx         → entry point
index.html
netlify.toml
```
