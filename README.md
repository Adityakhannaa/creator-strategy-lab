# Creator Strategy Lab — Game Theory-Based Analysis of Social Media Content Competition

A multi-step interactive web application for exploring strategic choices made by competing social media creators. It is a local React + TypeScript + Vite project.

## Features

- Four scenario presets: trend race, posting-time battle, collaboration vs. solo content, and quality vs. quantity.
- A 2×2 normal-form payoff matrix with editable payoff values.
- Pure-strategy Nash equilibrium detection based on mutual best responses.
- Best-response analysis for both players.
- Dominant-strategy checks and an interior mixed-equilibrium calculation when valid.
- Payoff comparison charts and a payoff heatmap.
- Interpretation, assumptions, and model limitations.
- Export a plain-text analysis report with the scenario, payoff matrix, equilibria, strategy checks, timestamp, and assumptions.
- Automated unit tests for Nash equilibria, ties, dominant strategies, and mixed-strategy calculations.
- Responsive layout with a warm paper/forest-green visual identity. It does not include a presentation or slide-show feature.

## Requirements

- Node.js 20 LTS or a recent supported Node.js release.
- VS Code (recommended).

Check Node and npm in the VS Code terminal:

```bash
node -v
npm -v
```

If either command is not found, install Node.js from https://nodejs.org, then quit and reopen VS Code.

## Run on macOS

1. Download and extract `social-content-game-theory.zip`.
2. Open VS Code.
3. Choose **File → Open Folder…** and select the extracted `social-content-game-theory` folder.
4. Choose **Terminal → New Terminal**.
5. Run these commands one at a time:

```bash
npm install
npm test
npm run dev
```

6. Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

Keep the terminal open while using the site. To stop the server, focus the terminal and press `Control + C`.

## Run the mathematical tests

```bash
npm test
```

The test suite covers coordination games with multiple pure equilibria, matching pennies with no pure equilibrium and a 50/50 mixed equilibrium, tied best responses, dominant strategies, and degenerate mixed-strategy cases.

## Build a production version

```bash
npm run build
npm run preview
```

The build output is created in `dist/`.

## How to use the simulation

1. **Choose a scenario** from the scenario screen.
2. **Inspect the payoff matrix.** Every cell is `(Creator A payoff, Creator B payoff)`. Payoff scores are hypothetical utility values from 0 to 10.
3. Select **Edit payoffs** to change the numbers. The equilibrium and analysis update from the new values.
4. **Analyze strategic behaviour.** Best responses are computed by comparing each player’s payoff against the opponent’s fixed choice. A pure Nash equilibrium is a cell where both players are best-responding.
5. **Explore results & graphs** to compare each player’s payoff and combined value.
6. **Interpret & conclude** to review the findings and limitations. Export the current analysis if needed.

## Model notes

This is an educational, simultaneous, two-player game with two strategies per player. The payoffs are intentionally hypothetical, and are not sourced from real social platform analytics. A Nash equilibrium means no player can improve their own payoff by changing strategy alone while the other player's choice is fixed. It does not necessarily mean the combined payoff is maximized or that the outcome is fair.

The mixed-strategy calculation reports only a valid interior candidate when both probabilities lie strictly between 0 and 1. Degenerate cases may have boundary equilibria or require a separate analysis; the pure equilibrium detector remains available.

## Project structure

```text
social-content-game-theory/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── gameTheory.ts
    ├── style.css
    └── tests/
        └── gameTheory.test.ts
```
