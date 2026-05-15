# Waywise Intelligent Travel Planner

Waywise is a deploy-ready travel planning web app. It generates keyless intelligent trip plans with day-by-day itinerary pacing, destination-aware budget estimates, packing suggestions, save/download/print actions, and a responsive interface.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Publish to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

When Firebase asks for the public directory, use `dist`. Keep the single-page app rewrite enabled.

## Notes

The planner does not require API keys. Its intelligence is a browser-side rule engine, so it is cheap to host and safe to publish as a static site. If you later want live AI generation, weather, hotel, or flight data, add those through a backend function so private API keys are never exposed in the browser.
