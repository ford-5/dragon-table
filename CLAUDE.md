# Dragon Table (the D&D app): Project Guide for Claude

## About this project
A web app for playing Dungeons & Dragons, built step by step as a **learning project**.
The person building it is a beginner who is learning to code through this project.

## How to help (most important)
- **Teach, don't just build.** Explain new concepts in plain language before writing code.
- **Small steps.** Add one feature at a time so each change is easy to understand.
- **Explain the code.** After writing code, walk through what each part does.
- **Offer a small challenge** at the end of each step to practice on their own.
- **No jargon without a definition.** If a technical term comes up, explain it briefly.
- Ask before adding new tools, libraries, or frameworks.

## Tech choices (for now)
- Plain **HTML, CSS, and JavaScript** — no frameworks, no build tools yet.
- Most pages work by opening them in a web browser. For the full app run `ruby server.rb` (see "Running the app").
- Save data in the browser with `localStorage` when needed.
- Two additions, both approved by the user: **PeerJS 1.5.4** (MIT, loaded from unpkg, pinned) for live games, and a small **Ruby helper server** (`server.rb`, Ruby ships with macOS) that holds the Anthropic API key for the AI Dungeon Master.
- Later (only when ready): Git, then possibly React.

## The double-click launcher (made 2026-11-25)
- `~/Applications/Dragon Table.app` (with a shortcut `~/Desktop/Dragon Table`): a small macOS app that opens Terminal and runs `Contents/Resources/run.command`, which starts `ruby server.rb` (port 8787) from a **snapshot copy of the published site** inside the app (`Contents/Resources/site`, taken with `git archive HEAD`, so it needs no access to ~/Documents), then opens http://localhost:8787. If the port is already in use it just opens the browser. It asks in Terminal for an Anthropic key (typed hidden, kept only in that window's memory, NEVER written to a file); pressing Enter skips the AI. The icon is the d20 made into `icon.icns`.
- It is a SNAPSHOT: after we publish new features, rebuild it (rsync/`git archive` into the app's `site` folder, copy to ~/Applications). The build lived in the scratchpad (not in the project). Not tested: double-clicking it from Finder (the pieces were tested separately so as not to open windows on the user's screen).

## Running the app
- Just the pages (no AI): open `index.html` from Finder, or `ruby server.rb` and go to http://localhost:8787 (recommended: all pages then share saved data).
- With the AI Dungeon Master: the USER types their own key in Terminal (never ask for it or put it in any file or chat):
  `cd ~/Documents/dnd-app`, `export ANTHROPIC_API_KEY="..."`, `ruby server.rb`, then open http://localhost:8787
- Players on the same Wi-Fi: `ruby server.rb --share` prints the Wi-Fi address. The AI endpoint still only answers requests from the computer running the server.

## The app is based on real D&D rules
Everything that is a game rule lives in `rules.js` and follows the SRD 5.2.1 (the 2024 rules).
Pages should **calculate** from the rules (modifiers, proficiency, HP, AC, saves, skills), never ask the player to type a number the rules can work out.

## Extra working habits with this user (learned along the way)
- For anything involving accounts, browsers or settings, give **one tiny step at a time** and wait for the answer. Ask short plain-text questions with a best guess, not multiple-choice pop-ups.
- Do the work for them where you can. Never ask for, see, or store their Anthropic key, passwords or payment details: they type those themselves (the launcher app asks for the key in Terminal and never saves it).
- Say honestly what was tested and what wasn't (no real phones, microphones, printers or multi-player sessions so far; the AI has only been tested against a fake API).
- End each feature with a plain summary, "new concepts" and a small challenge, like the earlier steps.
- Visible wording: **Game Master / GM** (not "Dungeon Master/DM"), and no "D&D" / "Dungeons & Dragons" on public pages (trademarks). "Compatible with fifth edition" and the exact SRD 5.2.1 attribution are required and already in the footers. File names (`dm.html`...) and saved-data keys still say dm on purpose.

## Where things are (one line each; full details in `docs/FEATURES.md`: search it for the file name)
**Pages**
- `index.html` start screen (a 3 × 3 "table" box: GM in the middle, 8 pages around it; install box, share + support links); `player.html` AI-or-live choice
- `ai-dm.html` AI Game Master (5 setup steps, chat, ready-roll button, music, redo, voice); `join.html` live games for players (waiting room, table feed, voice chat, music, shared map)
- `character.html` roster, creator (guide levels, multiclass), sheet (weapons & armor, spells, special item, minis/print links); `sheet.html` printable sheet + share links; `mini.html` Mini Maker (3D-print STL)
- `dm-start.html` GM choice; `dm-learn.html` GM course; `dm.html` GM Screen (one screen: side drawers + middle stage showing the map, adventure, Library, Battle Simulator, Characters, GM course or shop; live game, voice, music, party, initiative, notes, books); `battle.html` Battle Simulator; `map.html` Battle Map; `adventure.html` starter adventure "The Sunken Bell"
- `library.html` free SRD Library; `equipment.html` shop (3D-printed gear, Google Form orders); `support.html` tips, share, waiting list; `policies.html` privacy + shop policies; `dice.html` old dice roller (no longer linked)

**Shared scripts** (load order on a page: `dice.js`, `rules.js`, `spells.js`, `monsters.js`, `play.js`, `music.js`, `voice.js`, then the page script, then `pwa.js` and `feedback.js` last)
- `rules.js` ALL game rules and data (classes, species, items, weapons, armor, spellcasting tables, conditions, XP budgets) and every rule calculation; `spells.js` 339 SRD spells; `monsters.js` 288 SRD monsters
- `play.js` roll helpers (pass/fail), the sheet text for the AI, live-game data cleaners (`clean*`), share-link helpers; `dice.js` dice math; `music.js` generated music + `createMusicController`; `voice.js` 🔊/🎤 helper (`window.Voice`)
- `mini3d.js` 3D shapes + STL export; `equipment.js` shop products + order form settings; `monetize.js` tip links + waiting-list form; `feedback.js` the 💬 link on every page; `pwa.js` + `sw.js` install and offline support
- `server.rb` the Ruby helper server (serves the pages, hosts the AI endpoint, holds the API key); `style.css` all styles; `manifest.webmanifest`, `icons/`, `sitemap.xml`, `robots.txt`
- `docs/FEATURES.md` detailed notes per file/feature; `docs/LIMITS_AND_TESTING.md` known limits, how we test, roadmap

## When you add or change a page (checklist)
1. Copy the `<head>` tags (manifest, theme-color, icons) from `library.html`; add a meta description; use the shared nav (Home, Library, Characters, GM Screen, Equipment).
2. Script order as above, with `pwa.js` then `feedback.js` last before `</body>`.
3. Add new files to `APP_FILES` in `sw.js` and bump `CACHE_NAME`; add new pages to `sitemap.xml`.
4. Show anything that came from the network, a link or the user with `textContent` (never HTML), and clean untrusted data (`clean*` functions in `play.js`).
5. If the app starts collecting or sending new data, update `policies.html`.
6. Update `docs/FEATURES.md` (and this file's index if it is a new file). Keep `CLAUDE.md` short.
7. Test in the browser pane using a scratchpad copy (see below), also at phone width (375px), then commit and push.

## Testing (short version; more in `docs/LIMITS_AND_TESTING.md`)
- There is no Node here: run JavaScript checks in the browser pane. The pane can't read `~/Documents`, so copy the app to the scratchpad and run `ruby server.rb` from the copy (port 8787); a temporary `.claude/launch.json` with `{ "name", "port", "url" }` attaches the preview (delete it afterwards). Live games work between two tabs through the real PeerJS service.
- A fake Claude API (`AI_DM_UPSTREAM` env var) tests the AI without a key. Stop test servers when finished.


## Online and publishing
- Live site: https://ford-5.github.io/dragon-table/ (GitHub Pages, branch `main`, folder `/`). Repo: https://github.com/ford-5/dragon-table (public). Publish with `git add -A && git commit -m "..." && git push`; the site updates within a minute or two. GitHub's build list sometimes lags: confirm by fetching the live file with `curl`.
- Git uses a repo-local identity `ford-5` with GitHub's noreply email (the user's real email is never used). The GitHub CLI is at `~/tools/gh/bin/gh` (signed in as ford-5; it is also the Git credential helper).
- Renaming/branding: the app is **Dragon Table**. Accounts the user made: Google Forms (orders, feedback, waiting list; their IDs are in `equipment.js`, `feedback.js`, `monetize.js`), a Ko-fi page (payouts NOT set up, so `SUPPORT_LINKS` is empty on purpose until the user says so).

## D&D content rules
- Only use rules and content from the **SRD (System Reference Document)**, which is free under Creative Commons.
- Don't copy text from the official books that isn't in the SRD.
- Keep the SRD attribution (in `rules.js` and on the DM page) when adding SRD content.

## Code style
- Keep code simple and readable over clever.
- Use clear, descriptive names (e.g. `rollDice`, not `rd`).
- Add short comments explaining *why*, especially for new concepts.

## Roadmap (short)
Done: everything through the starter adventure, voice, music and shared map. Ideas: more backgrounds/species, class features by level, special-ability simulation in battles, a custom domain, real play-testing with friends, the online AI Game Master as a paid feature. Full history in `docs/LIMITS_AND_TESTING.md`.

