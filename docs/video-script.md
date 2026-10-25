# Video script: Wind Forecast Decision Dashboard

Target length: about 10 minutes (hard limit 10). Part 1 is a client pitch (~5 min), Part 2 a technical review (~5 min).
Spoken pace is about 140 words per minute, so each block lists its rough word budget.

**Before recording**
- Start the app (see "How to run" in the README or below) and open http://localhost:5173 (or the Vercel URL once deployed).
- Pre-open tabs: Decision View for 15 Jan (`/?date=2026-01-15`), Accuracy (`/accuracy`), Methodology, and your editor with `backend/app/services/cutoff.py`.
- Browser zoom 110-125% so text reads on video. Close notifications.
- Fill in the bracketed placeholders: [VERCEL URL], [TEST COUNT].

---

## Part 1: Client pitch (about 5 minutes)

### 0:00-0:40 The problem (~90 words)
**Screen:** Decision View, top of page.

> Every morning your day-ahead team buys power for tomorrow. Whatever wind doesn't cover, thermal plant has to, so the wind forecast directly sets how much you buy.
>
> Two questions matter at that moment. First: what did the forecast actually say *when I had to decide*, not what it says now with hindsight? Second: how much can I trust it, and how big a safety margin should I hold?
>
> This dashboard answers both, using Elexon's national wind data for January 2026.

### 0:40-2:00 Decision View (~180 words)
**Screen:** Point at each element as you mention it.

> I'm buying for Thursday 15 January. By default the decision is made at 09:00 London time the day before.
>
> This banner is the key guarantee: the forecast shown was published at 07:30 on the 14th, before my 09:00 cutoff. The dashboard never uses a forecast published after the cutoff, so this is exactly what a buyer could have seen.

**Action:** Change the cutoff to 14 Jan 03:00. The banner switches to 02:30.

> If I move the cutoff earlier, it falls back to the 02:30 forecast. Reset takes me back to the default.

**Action:** Reset. Point at the cards.

> Summary in gigawatts: peak 15.8 GW at midnight, low of 8.9 GW at four in the afternoon, 278.6 gigawatt-hours across the day.

**Action:** Hover the chart around 09:00.

> The teal line is the forecast; the dashed line is what actually happened. Hovering gives exact values, the miss, and when that forecast was published. Times are London, with UTC underneath.

### 2:00-3:40 Accuracy (~230 words)
**Screen:** Click "See accuracy details" on the reliability strip.

> The strip at the bottom already gave the short answer. Here's the full picture, for all of January.
>
> On average the forecast missed by 2.1 GW. But the most important number is the bias: plus 1.9 GW. Forecasts ran *high*. Less wind arrived than predicted, almost every week.

**Action:** Point at the callout.

> In plain English: 90% of the time the forecast made at the decision cutoff missed by less than 4.3 GW, and on average it ran 1.9 GW high. Those two numbers are your buffer.

**Action:** Point at the three charts.

> By hour of day, the misses are largest overnight and early morning. The distribution is clearly shifted to the right, the over-forecast side. And the further ahead the forecast was made, the worse it gets: from 1.8 GW at four hours ahead to 2.5 GW at 47 hours.

**Action:** Click "Worst over-forecast".

> The worst miss: 1 a.m. on 12 January, the forecast was 6.9 GW too high. One click takes me to that moment, with a day either side, so I can see how the gap built up.

### 3:40-4:40 So what (~140 words)
**Screen:** Switch horizon to 24h, then back to "At cutoff".

> So what should the desk do?
>
> One: don't take the forecast at face value. In January it ran about 1.9 GW high on average.
>
> Two: the bias grows with wind. On days forecast at 4 to 8 GW it was about half a gigawatt; on days forecast above 20 GW it was over 4 GW. Windy days are when you're most exposed.
>
> Three: size your backup from the P90 miss, about 4.3 GW at decision time, not from the average.
>
> One caveat, which is on the Methodology page: this is one month of data. Winter may not represent summer.

### 4:40-5:00 Close Part 1 (~40 words)
**Screen:** Methodology page, scroll briefly.

> Everything's explained here in plain language: data sources, how the cutoff works, what each metric means, and the limits. That's the pitch. Now, how it's built.

---

## Part 2: Technical review (about 5 minutes)

### 5:00-5:50 Architecture (~120 words)
**Screen:** Repository tree in the editor.

> Three parts. A one-off ingest script pulls Elexon's FUELHH actuals and WINDFOR forecasts, validates them, and writes small Parquet files: about 130 KB in total. The FastAPI backend loads those into memory at startup and serves five JSON endpoints. The React frontend, in TypeScript with Recharts and React Query, calls them.
>
> No database. The data is small, read-only, and fixed for one month, so a database would add moving parts for no benefit. If ingestion became continuous, that's when I'd add one. And the app never calls Elexon at request time.

### 5:50-6:50 Ingestion and data findings (~140 words)
**Screen:** `scripts/` folder, then `scripts/README.md`.

> I checked the API parameters against Elexon's OpenAPI spec before writing anything. The ingest is split by job: an HTTP client with seven-day chunks and retry, Pydantic models that validate every raw record, a transform step, and table-level validation that prints a report.
>
> Exploring the data surfaced two things the spec didn't say. WINDFOR forecasts are hourly, not half-hourly, so each forecast is compared with the actual at the same start time. And WINDFOR never looks more than about 47.6 hours ahead. Rather than offer a 48-hour option that always comes back empty, the ingest measures the longest horizon the data supports and writes the option list to meta.json. The UI only offers horizons that return data.

### 6:50-8:00 Core logic: the cutoff (~160 words)
**Screen:** `backend/app/services/cutoff.py`.

> This is the heart of it. The default cutoff is 09:00 London on the day before, built with zoneinfo and converted to UTC, so it's correct across daylight-saving changes. Delivery days are London days too, so a clock-change day has 23 or 25 hours.
>
> Selection is simple and strict: filter to forecasts published at or before the cutoff, then for each target hour keep the one with the latest publish time. A target with no eligible forecast stays missing; it's never filled with zero or with a later forecast.
>
> Accuracy by horizon uses the same idea: for horizon h, the latest forecast published at least h hours before the target. Error is always forecast minus actual, and metrics are computed server-side: MAE, RMSE, bias, MAPE only where actual is above 100 MW, P90, and the worst miss each way.

### 8:00-8:50 Backend structure (~120 words)
**Screen:** `backend/app/`: routers, services, `dependencies.py`, `queries.py`.

> The backend is layered so pieces can be swapped. Services are pure functions over DataFrames. They get data through a repository interface, implemented for Parquet today. Query parameters are validated by Pydantic models; one central handler turns validation errors into readable 400s. Out-of-range dates return 404. Valid requests that select no data return a 400 that says why, for example "no forecasts published at least 48 hours ahead". Responses are cached per parameter set, and every endpoint answers in well under 300 ms.

### 8:50-9:20 Checking the bias wasn't a bug (~70 words)
**Screen:** Methodology, "Findings and limitations".

> A 1.9 GW bias is either a finding or a bug, so I checked before presenting it: sign and units, shifting actuals by up to two hours, and splitting by horizon and by wind level. No timing or sign issue; the gap is steady across horizons and grows with wind. So it's real, most likely a metering difference or high-wind curtailment.

### 9:20-9:50 Testing, deployment, AI use (~70 words)
**Screen:** Terminal running tests, then the live site.

> [If tests are written:] [TEST COUNT] backend tests cover cutoff selection, including a daylight-saving day and gaps, each metric against hand-computed values, and every endpoint.
>
> It runs locally with one Docker Compose command, and it's live at [VERCEL URL].
>
> I built this with Claude Code as an AI assistant, under my direction. I made the design decisions and reviewed the code, and it's disclosed in the README.

### 9:50-10:00 Close (~20 words)

> Thanks for watching. The repo has the README, the docs and the run instructions.

---

## Numbers used (January 2026, at decision cutoff unless noted)
| Figure | Value |
|---|---|
| Hours analysed | 744 |
| MAE / RMSE | 2.1 GW / 2.6 GW |
| Bias | +1.9 GW (forecast high) |
| P90 miss | 4.3 GW |
| Worst over-forecast | +6.9 GW, 12 Jan 01:00 |
| Worst under-forecast | -3.4 GW, 8 Jan 19:00 |
| MAE by horizon | 1.8 GW at 4h to 2.5 GW at 47h |
| 15 Jan Decision View | forecast as of 14 Jan 07:30; peak 15.8 GW, min 8.9 GW, 278.6 GWh |
| Bias by forecast level | +0.5 GW at 4-8 GW; +4.5 GW above 20 GW |
