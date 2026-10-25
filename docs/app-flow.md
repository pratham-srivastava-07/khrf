# App Flow

## Navigation
Top bar: logo/title (left), tabs (center): **Decision View** | **Accuracy** | **Methodology**. Routes: `/` (Decision View), `/accuracy`, `/methodology`. Unknown routes redirect to `/`.

## Global behavior
- On first load the app calls `/api/meta` to learn the date range and defaults. A full-page skeleton shows until it resolves. If it fails, show an error panel with a Retry button.
- Filter state lives in URL query params so views are shareable (e.g. `/?date=2026-01-15`).

## Screen 1: Decision View (`/`)
**What the user sees (top to bottom):**
1. Controls row: Delivery date picker (limited to Jan 2026), Cutoff time control (default shown as "D-1 09:00 London"), "Show actuals" toggle.
2. Banner: "Forecast as of <publishTime range>. Decision made before <cutoff>."
3. Summary cards: Peak (GW), Minimum (GW), Average (GW), Total expected (GWh).
4. Main chart: 48-point forecast line for the day (actuals overlaid if toggle is on and data exists).
5. Reliability strip: "Typical miss at this horizon: ±X MW (P90)". Link: "See accuracy details".

**Interactions:**
- Change date -> re-fetch `/api/forecast`; chart shows skeleton, then new data.
- Change cutoff -> re-fetch; banner and chart update.
- Toggle actuals -> client-side only, no fetch.
- Hover chart -> tooltip with time (London, UTC on hover), forecast MW, actual MW, error.
- Click "See accuracy details" -> go to `/accuracy` with the same horizon preselected.
- Date with no data -> empty state "No forecast available for this date."

## Screen 2: Accuracy (`/accuracy`)
**What the user sees:**
1. Controls: date range (default Jan 1-31), horizon dropdown (At cutoff, 4h, 12h, 24h, 36h, 48h).
2. Metric cards: MAE, RMSE, Bias, P90 error, Worst over, Worst under.
3. Buffer guidance callout in plain English.
4. Charts: Error by hour of day (bars), Error distribution (histogram), Error vs horizon (line).
5. Forecast vs actual time series for the chosen range.

**Interactions:**
- Change range or horizon -> re-fetch `/api/accuracy` and `/api/timeseries`; cards and charts show skeletons then update.
- Click a worst-error card -> jump the time series chart to that timestamp and highlight it.
- Range where end < start is prevented in the UI.

## Screen 3: Methodology (`/methodology`)
Static content: data sources, how the cutoff is applied, metric definitions, limitations, and the AI-tools disclosure. Link back to Decision View.

## Error and edge states
- API error: inline error card with message and Retry; the rest of the page stays usable.
- Slow request (>1 s): skeleton remains; no spinner flicker.
- Missing points: line chart shows a gap; tooltip shows "No data".

## Primary user journeys
1. **Daily decision**: open app -> Decision View for tomorrow -> read forecast and P90 miss -> decide a buffer.
2. **Trust check**: Accuracy tab -> pick 24h horizon -> read MAE/P90 -> back to Decision View.
3. **Investigate a miss**: Accuracy -> click worst under-forecast -> inspect time series at that moment.