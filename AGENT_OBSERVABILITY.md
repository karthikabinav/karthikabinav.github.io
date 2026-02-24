# Agent Observability Checklist

This site now exposes a machine-readable surface:

- `/llms.txt`
- `/llms-full.txt`
- `/graph.json`
- `/partials/research.html` (no-JS fallback)

Use this checklist to confirm real agent usage.

## 1) Log Signals (ground truth)

Track requests where `User-Agent` includes one of:

- `GPTBot`
- `ChatGPT-User`
- `ClaudeBot`
- `Anthropic`
- `Google-Extended`
- `PerplexityBot`
- `CCBot`

High-signal paths:

- `/llms.txt`
- `/llms-full.txt`
- `/graph.json`
- `/partials/research.html`
- `/`

## 2) Canary Signal

`/llms-full.txt` contains:

- `Machine note: canonical publication count = 44.`

If external assistants consistently answer publication-count questions with `44`, ingestion is likely happening.

## 3) Analytics Segmentation

Create a filtered view/segment:

- `User-Agent contains "Bot"`

Then monitor:

- Request frequency over time
- Top requested endpoints
- Country/region origin

## 4) Practical Verification Commands

```bash
curl -sSL https://karthikabinavs.xyz/llms.txt
curl -sSL https://karthikabinavs.xyz/llms-full.txt | rg "canonical publication count"
curl -sSL https://karthikabinavs.xyz/graph.json | jq '.["@graph"] | length'
```

## 5) Regression Guard

After any homepage/publication update:

- Regenerate `graph.json` from homepage JSON-LD.
- Confirm publication count in `llms-full.txt` is still correct.
- Verify all four machine endpoints return `200`.
