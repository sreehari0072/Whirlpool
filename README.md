# baa-bye.com — The Goat That Eats Your Website 🐐

> **"Type something. We promise nothing will happen."**  
> *Unfortunately, there's a goat.*

A deliberately useless, highly interactive, funny web experience built for hackathons and laughs.

---

## 🌟 Features

1. **Procedural Web Audio API Sound Engine**
   - Real-time synthesized comic sounds: crunchy `nom nom` bites with pitch variation, realistic dual-formant goat bleats (`Baaaa-a-a-ah!`), deep rumbling burps, bubble pops, and fanfare.
   - **Zero external audio files**: 100% reliable, zero network latency, zero missing asset 404s.

2. **Interactive Cartoon Goat Rig**
   - Custom dynamic SVG character rig with:
     - Breathing sleeping state with floating `Zzz` bubbles
     - Eye tracking: pupils follow your mouse and gaze at typed text
     - Chomping articulated lower jaw and swinging goatee beard
     - Responsive belly that scales from a normal size to an **Absolute Planetary Unit**
     - Accessories: Cool pixel sunglasses (`goat` easter egg) and party confetti

3. **Physics-Driven Character Eating**
   - Characters typed into the textarea are detected by the goat.
   - As eating begins, letter tokens peel off from the input and fly in curved bezier arcs directly into the goat's mouth!
   - On impact: jaw snaps shut (`CHOMP!`), crumb particles burst, counter increments, and the letter is removed from the textarea.

4. **Burp & Screen Shake Event**
   - Stop typing for ~2.4 seconds after feeding the goat:
     - Goat inhales, jolts backward, and releases a comic burp!
     - Entire screen shakes with `@keyframes burpShake`!
     - A green burp smoke cloud (`💨 BURRRRP! 🫧`) erupts.
     - Some of the eaten text is humorously regurgitated in scrambled order!

5. **The Goat Roast System**
   - Delivers a punchy, sarcastic roast after every burp event.
   - **50+ Built-in categorized roasts** tailored to typing length, speed, ALL CAPS, keyboard mashing, and food references.
   - **Optional Gemini AI integration**: Paste an optional Gemini API key in the UI for dynamically tailored AI super-roasts!

6. **Easter Eggs & Secret Interactions**
   - Type `"grass"`: Triggers Frenzy Grass Mode with 3x eating speed, clover confetti shower, and excited bleating.
   - Type `"goat"`: The goat dons cool black sunglasses, horns glow gold, and drops a boss quote.
   - Type fast (> 260 CPM): Turbo eating speed mode activates!
   - Poke/Click the goat: Plays surprised reactions or grumpy bleats.
   - Random goat thoughts: Derpy speech bubbles appear while resting ("MORE.", "WHERE IS THE GRASS?", "KEEP TYPING.").

7. **Local Leaderboard & Feeder Ranks**
   - Tracks all-time letters fed, best single feast, and total burps via `localStorage`.
   - Dynamic Feeder Ranks:
     - *Light Appetizer* (1-24)
     - *Snack Supplier* (25-59)
     - *Cardboard Connoisseur* (60-119)
     - *Master Grazier* (120-199)
     - *Absolute Planetary Unit* (200-299)
     - *Alphabet Black Hole* (300+)

---

## 🚀 How to Run

### Option 1: Direct File Launch
Simply double click or open `index.html` in any web browser (Chrome, Edge, Firefox, Safari).  
Everything runs locally with zero installation required!

### Option 2: PowerShell HTTP Server
Run the included PowerShell static server:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Then visit: [http://localhost:8080](http://localhost:8080)

---

## 🎪 5-Second Hackathon Demo Script

1. **Open the page**: Judge sees a cute goat sleeping peacefully near the bottom of the screen with subtle "Zzz" bubbles.
2. **Type a sentence**:
   ```
   Hello judges, welcome to our project...
   ```
3. **Goat wakes up**: Eyes snap open, exclamation mark pops up, goat stares at the textarea!
4. **Goat charges**: Mouth chomps, letters fly out of the textarea into the goat's mouth, crunchy *NOM NOM NOM* sounds play, belly visibly swells!
5. **Stop typing**:
   - Goat pauses, inhales, and **BURPS!**
   - Screen shakes vigorously!
   - Burp cloud pops up!
   - Speech bubble roasts the judge: *"I ate your essay. It tasted like procrastination."*
   - Results banner reveals: **"YOU FED THE GOAT 42 CHARACTERS. HE IS STILL HUNGRY."**
6. **Trigger Easter Egg**:
   - Type `"grass"` -> Clover confetti storm + frenzy eating!

---

## 📁 Code Structure

```
baa-bye/
├── index.html           # Main semantic HTML5 interface
├── styles.css           # Clean, playful CSS design system & animations
├── server.ps1           # Optional local static server
├── README.md            # Documentation & demo script
└── js/
    ├── audio.js         # Web Audio API procedural sound engine
    ├── goat.js          # Dynamic SVG goat state machine & animation
    ├── eatingEngine.js  # Typing cadence, projectile letter physics, crumbs
    ├── roasts.js        # 50+ roast library & optional Gemini AI hook
    ├── easterEggs.js    # Grass frenzy, sunglasses, poke interactions
    ├── leaderboard.js   # LocalStorage high scores & ranks
    └── main.js          # Application coordinator
```
