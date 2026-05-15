# Travel Planner — AI Itinerary Generator

A single-file AI travel planner web app. Everything lives in `index.html`; there is no npm install and no build step.

## Use

Open `index.html` in a browser, or deploy it as a static site.

The app uses the Gemini REST API:

`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`

Add your Gemini API key in either place:

- Paste it in the settings drawer at runtime.
- Put it in the `HARDCODED_GEMINI_API_KEY` variable inside `index.html`.

## Deploy

For Firebase Hosting, this repo is configured to serve the project root:

```bash
firebase deploy
```
