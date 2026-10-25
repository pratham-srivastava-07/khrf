# Methodology notes (content for the Methodology page, Phase 7)

Findings from data exploration that the Methodology page must include.

## Forecast horizon limit
Elexon WINDFOR does not publish forecasts more than about two days ahead. In the January 2026 data the longest horizon is 47.6 hours, so the furthest horizon offered is 47 h rather than 48 h. The horizon list in `meta.json` is derived from the data at ingest: 4, 12, 24, 36, plus the largest whole-hour horizon with forecast/actual pairs. At 47 h only about 30% of hours (217 of 744) have a forecast, so its metrics rest on fewer points than the shorter horizons.

## Forecast resolution
WINDFOR forecasts are hourly; FUELHH actuals are half-hourly. Each hourly forecast is compared with the actual for the half-hour starting at the same time (:00). The :30 actuals are shown on charts but have no forecast to compare against.

## Systematic over-forecast (about +1.9 GW)
In January 2026 the forecast ran higher than actual wind output on average: bias about +1.85 GW at the decision cutoff (forecast mean 13.4 GW vs actual 11.6 GW).

Checks run to rule out a bug:
- Sign and units: error = forecast - actual, both in MW.
- Time alignment: shifting actuals by ±1, ±2 and ±4 half-hours does not reduce the error (MAE 1,822 to 1,996 MW, best at 0 or +1). No timestamp or settlement-period mismatch.
- Using the hourly mean of both half-hours instead of the :00 half-hour gives the same bias (+1.65 GW at 4 h).
- By horizon: +1.6 GW at 0 h, +1.7 GW at 12 h, +1.85 GW at 24 h, +1.95 GW at 36 h. Mostly a constant offset, with a small genuine increase as horizon grows.
- By level: the bias grows with forecast size: +0.5 GW when 4-8 GW is forecast, +2.6 GW at 16-20 GW, +4.5 GW above 20 GW. Actual output peaked at 17.8 GW while forecasts reached 21.4 GW.
- By week: positive every week (+1.2 to +2.4 GW).

Interpretation: a real, consistent result, not a bug. Its shape (an offset present even at 0 h, growing at high wind) fits a definition or metering difference between the datasets (FUELHH WIND counts transmission-metered output) and/or curtailment and constraints in high wind, when actual output sits below what the wind could deliver. The cause has not been confirmed against Elexon's dataset definitions.

Pitch line: "In January the forecast ran about 1.9 GW high on average, and more on very windy days; budget for that when buying."

Caveat: measured on one month only (January 2026). It may not hold in other seasons.
