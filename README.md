# UNSCRAMBLE THE WORDS

A lightweight, responsive Friday activity built with plain HTML, CSS, and JavaScript. It works without a backend or build step.

## Run it

Open `index.html` in a current web browser. For local sharing across devices, serve this folder from a static web host (for example, GitHub Pages or Netlify) and share the resulting page link in WhatsApp. The Google Fonts stylesheet uses an internet connection; the system sans-serif fallback works offline.

## Play

Choose **PLAY NOW**. One scrambled word appears at a time with its own 45-second countdown. Enter the answer and select **CHECK** (or press Enter); answers are accepted in either case. A correct answer or timeout advances to the next word and starts a fresh timer. After all five rounds, the game reveals **START**. Select **SHOW ME THE MESSAGE** to see the English and Arabic encouragement. **START OVER** resets the word round; **PLAY AGAIN** returns to a fresh round.

## Files

- `index.html` — screens, puzzle cards, final message, and CSS illustration
- `styles.css` — responsive visual design, transitions, and animations
- `game.js` — answer checking, solved-word tracking, progress, and screen flow
