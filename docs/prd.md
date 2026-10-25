# PRD: Wind Forecast Decision Dashboard

## 1. Summary
A web dashboard for a UK energy utility's day-ahead power buying team. It shows (1) the latest wind generation forecast available at the moment they must decide, and (2) how accurate wind forecasts have historically been, so they can size a safety margin when buying backup power.

The product does NOT place orders or buy electricity. It is decision support only.

## 2. Context
- Client: UK energy utility, day-ahead procurement team.
- Decision: buy power D-1 for delivery day D. The shortfall = demand minus wind (and other renewables), covered by thermal plants.
- Scope limits: national-level wind only; Elexon data only (FUELHH actuals, WINDFOR forecasts); decisions for delivery days in January 2026.

## 3. Goals
1. Show the latest forecast that was actually available at decision time (no look-ahead leakage).
2. Quantify forecast error so buyers can plan a margin.

## 4. Non-goals
Demand forecasting, price data, other fuel types, auth/users, order placement, real-time streaming, regional data.

## 5. Users
Primary: day-ahead power buyer/trader. Secondary: analyst reviewing forecast quality. Both are non-developers, comfortable with MW/GW and charts.

## 6. Features

### F1. Decision-time forecast view (core)
- Select a delivery date (Jan 2026) and a decision cutoff (default: D-1 09:00 Europe/London, editable).
- Show the 48 half-hourly forecast values for that day, using for each target time the latest forecast with publishTime <= cutoff.
- Show the publishTime range of forecasts used ("Forecast as of ...").
- If actuals exist, overlay them (toggle).
- Show key stats: peak forecast, minimum, daily average, total expected MWh.

### F2. Accuracy analysis (core)
- Date range selector (default: full January 2026) and forecast horizon selector (e.g. 4h, 12h, 24h, 36h, 48h; plus "as at decision cutoff").
- Metrics: MAE, RMSE, bias (mean error), MAPE (guarded for low values), P90 absolute error, worst under-forecast and over-forecast.
- Charts: error by hour of day, error distribution histogram, error vs horizon.
- Plain-language "buffer guidance": e.g. "90% of the time the forecast missed by less than X MW."

### F3. Forecast vs actual time series
- Chart of forecast vs actual across a selected range, with error band/shaded difference.
- Hover tooltip with exact values.

### F4. Methodology & data notes
- Short page explaining data sources, cutoff logic, metric definitions, and limitations.

## 7. UX requirements
- Single-page app with 3 tabs/routes: Decision View, Accuracy, Methodology.
- Loading skeletons, empty states, and error states for every data view.
- Responsive down to tablet width; desktop-first.
- Units always shown (MW; GW on summary cards).
- Timestamps shown in Europe/London with UTC available on hover.

## 8. Functional requirements
- FR1: Cutoff logic must never use forecasts published after the cutoff.
- FR2: Missing forecast or actual points are shown as gaps, never zero-filled.
- FR3: All metrics computed server-side.
- FR4: Date inputs restricted to the available data range.

## 9. Success metrics
- Correctness: cutoff-selection unit tests pass; metrics match an independent pandas calculation.
- Performance: each API call < 300 ms locally; first load < 3 s on Vercel.
- Delivery: demo video <= 10 min, public repo with README, live Vercel URL, Docker runs with one command.
- Demo quality: a viewer understands the problem and the "so what" within the first 2 minutes.

## 10. Deliverables
Public GitHub repo (anonymous name), README (files, how to run, Vercel link, AI-tools disclosure), deployed Vercel app, unlisted YouTube video (Part 1 client pitch, Part 2 tech review).

## 11. Constraints
React + Python backend, Docker, Vercel deployment, max 16 hours of effort, Elexon data only.