# Dragon Table

A small web app for playing fifth-edition tabletop adventures, built as a learning project
with plain HTML, CSS and JavaScript.

## What it does

- **Start screen:** choose Player or Game Master.
- **Players** choose an **AI Game Master** or a **Live Game Master**.
  - **AI:** pick Beginner, Intermediate or Advanced help (Beginner is a step-by-step tutorial), choose or
    create a hero (the creator follows the free SRD 5.2.1 rules, including optional two-class heroes),
    set up a campaign, choose a special item from a list or invent your own, and play. Runs on your own
    computer only; see below.
  - **Live:** type the GM's game code and wait in the waiting room until your GM opens the game, then
    join with live voice chat.
- **Game Masters** choose **Learn to be a GM** (a short course) or **Run a game**. The GM screen has the
  rulebook links and conditions reference, a **Battle Simulator** with the SRD's monsters, party HP,
  initiative tracker, secret rolls, notes, and **Request players** with accept/decline and live voice chat.
- **Battle Map:** a grid for heroes, monsters, walls and water that counts movement by the rules.
- **Mini Maker:** turn any hero into a 3D-printable miniature (.stl file), or order it printed.
- **Equipment:** a shop for 3D-printed terrain, obstacles, miniatures, tokens and dice. Orders go to a Google Form.
- A dice roller with modifiers and advantage/disadvantage.
- **Installable:** add it to your phone's home screen; most pages work offline.

Characters are saved in your own browser. Live games connect the GM's and players' browsers
directly (using [PeerJS](https://peerjs.com/)); nothing about the game is stored online.

## Running it on your own computer

You need macOS (Ruby is built in) or any computer with Ruby installed.

```bash
cd dnd-app
ruby server.rb
```

Then open http://localhost:8787. Add `--share` to let players on the same Wi-Fi open it.

### The AI Game Master

The AI uses the Claude API and needs your own Anthropic API key. The key stays on your
computer: the helper server holds it, never the web page. Type this yourself in Terminal:

```bash
export ANTHROPIC_API_KEY="your key"
ruby server.rb
```

Using the API costs money on the account that owns the key. The online copy of this app
cannot use the AI.

## License and attribution

This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards
of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the
Creative Commons Attribution 4.0 International License, available at
https://creativecommons.org/licenses/by/4.0/legalcode.

Compatible with fifth edition.
