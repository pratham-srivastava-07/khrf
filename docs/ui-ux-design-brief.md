# UI/UX Design Brief

## Skills to use
Before writing or restyling any UI code, load and follow these skills:
- **frontend-design**: use at the start of every new screen or major component to set aesthetic direction and avoid templated defaults.
- **design-taste-skill**: use when choosing layout, spacing, hierarchy, and when reviewing a finished screen for polish. Run a taste review pass on each screen before calling it done.
- **emil-design-engineering skill**: use for interaction details: hover/focus states, micro-animations, easing, transitions, and perceived performance. Apply to chart tooltips, tab changes, and skeleton-to-content transitions.
- **ui-ux-pro-max skill**: use for the overall design system, accessibility checks, and final UX review of each screen and flow.

Order of use: ui-ux-pro-max (system) -> frontend-design (screen direction) -> design-taste-skill (review) -> emil-design-engineering (interaction polish).

## Personality
Calm, precise, trustworthy. This is a tool for money-moving decisions. Think "refined control room", not "marketing site". Dense but breathable; no decorative clutter.

## Color palette (light theme default, dark theme optional)
| Role | Hex |
|---|---|
| Background | #F7F8FA |
| Surface (cards) | #FFFFFF |
| Border | #E3E6EC |
| Text primary | #0F172A |
| Text secondary | #5B6577 |
| Forecast series (accent) | #0E7C86 (teal) |
| Actual series | #1E293B (slate-dark) |
| Over-forecast | #D97706 (amber) |
| Under-forecast | #2563EB (blue) |
| Error/alert | #DC2626 |
| Success | #15803D |

Dark theme (if time allows): background #0B1220, surface #121A2B, same series colors lightened ~15%. Do not rely on color alone to carry meaning; use labels and line styles (solid vs dashed).

## Typography
- UI: Inter (fallback system-ui).
- Numbers and metrics: tabular figures (`font-variant-numeric: tabular-nums`) or JetBrains Mono for large metric values.
- Scale: 12 / 14 / 16 / 20 / 28 / 36 px. Page title 28, card values 28-36, body 14, captions 12.
- Weights: 400 body, 500 labels, 600 headings.

## Layout & spacing
- 8px spacing grid. Max content width 1280px, centered. 24px gutters.
- Cards: 12px radius, 1px border, very subtle shadow (0 1px 2px rgba(15,23,42,0.06)).
- 12-column grid; metric cards 4 across (desktop), 2 across (tablet).

## Components
- **Top nav**: 56px height, title left, pill-style tabs, active tab underlined in teal.
- **Metric card**: label (12px, secondary), value (28-36px), unit, optional delta/help tooltip.
- **Controls**: date picker, segmented control for horizons, switch for toggles. All keyboard accessible with visible focus rings (2px teal).
- **Charts (Recharts)**: light gridlines, no chart borders, 2px lines, legend top-left, tooltip card matching surface style. Forecast solid teal, actual solid dark slate, error shading light amber/blue.
- **Callout**: soft teal-tinted background with left border, used for buffer guidance.
- **Skeletons**: same shape as final content, subtle shimmer.
- **Empty/error states**: icon, one-line explanation, action button.

## Screen sketches (rough)
**Decision View**
```
[ Nav: Title | Decision View  Accuracy  Methodology ]
[ Date ▾ ] [ Cutoff: D-1 09:00 London ✎ ] [ Show actuals ○ ]
[ Banner: Forecast as of 14 Jan 08:00 – 08:30 UTC ]
[ Peak ] [ Min ] [ Average ] [ Total GWh ]
[            Large forecast (+actual) line chart            ]
[ Reliability strip: typical miss ±X MW (P90)   See details → ]
```
**Accuracy**
```
[ Range ▾ ] [ Horizon: At cutoff | 4h | 12h | 24h | 36h | 48h ]
[ MAE ][ RMSE ][ Bias ][ P90 ][ Worst over ][ Worst under ]
[ Callout: 90% of the time the forecast missed by < X MW ]
[ Error by hour (bars) ][ Error histogram ][ Error vs horizon ]
[            Forecast vs actual time series            ]
```
**Methodology**: single readable column, max 720px, headings and short paragraphs.

## Motion
Subtle only: 150-200ms ease-out for hover and tab changes; chart lines animate once on first draw; respect `prefers-reduced-motion`.

## Accessibility
WCAG AA contrast, keyboard navigable, aria-labels on charts with a text summary, focus states visible, tooltips accessible on focus.

## Copy tone
Plain, specific, no jargon without a tooltip. Example: "The forecast missed by up to 1.8 GW in 90% of half-hours" rather than "P90 AE 1800 MW".