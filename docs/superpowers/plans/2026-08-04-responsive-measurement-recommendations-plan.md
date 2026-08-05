# Responsive Measurement and Recommendation Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate measurement metadata responsively in the header and AQI card, and restore readable recommendation contrast in dark mode without changing AQI semantics or data contracts.

**Architecture:** Keep the existing components and status-class map. Split label/value text into separate inline elements that stack below the mobile breakpoint and return to a row from `sm`. Add dark-mode Tailwind variants to the existing status classes so the recommendation palette remains semantic while using dark surfaces and bright text/borders.

**Tech Stack:** React, TypeScript, Tailwind utility classes, Vitest, Testing Library, Playwright CLI.

## Global Constraints

- Do not modify pipeline, Supabase, RPC, Core DB, environmental providers, or data shapes.
- Preserve the existing measurement format and freshness copy: `Actual`, `+12 h`, `+24 h`, `Sin validar`.
- Preserve all seven `AirQualityStatus` meanings and recommendation copy.
- Keep `/lab/aqi-home-v2` unchanged and `noindex,nofollow`.
- Validate at 390×844 and 1440×1000 in light and dark themes.

---

### Task 1: Responsive measurement metadata

**Files:**
- Modify: `src/components/Layout.tsx` — split the header `Medición` pill into label/value spans with mobile column layout.
- Modify: `src/components/AqiHomeV2Prototype.tsx` — split freshness and time into spans with mobile column layout.
- Test: `src/components/Layout.test.tsx` — assert the header measurement label/value remain present.
- Test: `src/components/AqiHomeV2Prototype.test.tsx` — assert freshness and measurement time are separate nodes.

**Interfaces:**
- Consumes the existing `airQualityData.timestamp` and `measurementFreshness` values.
- Produces the same visible text and accessible measurement information with responsive layout classes.

- [ ] **Step 1: Write the failing tests**

Add assertions that the measurement label and time are separate elements and that the responsive class contract is present. Keep the existing fixed timestamp fixture and freshness assertions.

```tsx
const freshness = screen.getByText('Actual');
const measurementTime = screen.getByText(/6:20/);

expect(freshness).not.toBe(measurementTime);
expect(freshness.parentElement).toHaveClass('flex-col', 'sm:flex-row');
```

- [ ] **Step 2: Run the focused tests to verify RED**

Run:

```bash
npm test -- --run src/components/Layout.test.tsx src/components/AqiHomeV2Prototype.test.tsx
```

Expected: the new structural/class assertions fail because the current label and time are rendered as one inline string or the current pill does not have the responsive column contract.

- [ ] **Step 3: Implement the minimal responsive structure**

In `Layout.tsx`, replace the adjacent text spans with a label span and value span inside a responsive wrapper. In `AqiHomeV2Prototype.tsx`, replace the interpolated freshness string with separate freshness and time spans inside a responsive wrapper. Use base `flex-col` and `sm:flex-row`; retain the existing colors and content.

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run the same focused command and confirm all existing and new assertions pass.

- [ ] **Step 5: Commit the task**

```bash
git add src/components/Layout.tsx src/components/Layout.test.tsx src/components/AqiHomeV2Prototype.tsx src/components/AqiHomeV2Prototype.test.tsx
git commit -m "fix: separate measurement metadata responsively"
```

### Task 2: Dark-mode recommendation contrast

**Files:**
- Modify: `src/components/Recommendations.tsx` — add dark-mode text, background, border, and icon-surface variants for every status.
- Create: `src/components/Recommendations.test.tsx` — cover all seven statuses and the dark contrast class contract.

**Interfaces:**
- Consumes the existing `status: AirQualityStatus` and `AQI_RECOMMENDATIONS` map.
- Produces the same three recommendation items and copy with status-preserving light/dark classes.

- [ ] **Step 1: Write the failing test**

Create a real render test using each `AirQualityStatus`. Assert that each state renders three list items, preserves its existing status-specific accent class, and includes dark variants on the list item, border, and icon surface.

```tsx
it.each<AirQualityStatus>([
  'good', 'moderate', 'unhealthy-sensitive', 'unhealthy',
  'very-unhealthy', 'hazardous', 'unknown',
])('keeps readable dark surfaces for %s', (status) => {
  render(<Recommendations status={status} />);
  const items = screen.getAllByRole('listitem');

  expect(items).toHaveLength(3);
  expect(Array.from(items[0].classList).some((className) => className.startsWith('dark:bg-'))).toBe(true);
  expect(Array.from(items[0].classList).some((className) => className.startsWith('dark:border-'))).toBe(true);
  expect(Array.from(items[0].firstElementChild?.classList ?? []).some((className) => className.startsWith('dark:bg-'))).toBe(true);
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
npm test -- --run src/components/Recommendations.test.tsx
```

Expected: FAIL because the current status class map has no dark-mode variants.

- [ ] **Step 3: Implement the minimal dark variants**

Extend each `STATUS_CLASSES` entry with Tailwind `dark:` classes. Use bright text (`*-200` or lighter), dark opaque surfaces (`*-950/60` to `*-900/75`), visible dark borders (`*-700/70` or equivalent), and a differentiated dark icon background. Do not alter recommendation copy or status selection.

- [ ] **Step 4: Run focused and full tests to verify GREEN**

Run:

```bash
npm test -- --run src/components/Recommendations.test.tsx src/components/AqiHomeV2Prototype.test.tsx src/components/Layout.test.tsx
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 5: Commit the task**

```bash
git add src/components/Recommendations.tsx src/components/Recommendations.test.tsx
git commit -m "fix: improve recommendation contrast in dark mode"
```

### Task 3: Full validation and PR preview

**Files:**
- Inspect only: changed source/tests and generated preview output.

- [ ] **Step 1: Run static validation**

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

Warnings inherited from unrelated files remain out of scope.

- [ ] **Step 2: Run browser QA on the branch preview**

Verify Home at 390×844 and 1440×1000 in both themes. Confirm the header pill and AQI freshness chip do not crowd, recommendation text remains readable in dark mode, no horizontal overflow exists, and the console has no errors.

- [ ] **Step 3: Confirm PR preview and metadata**

Push `feat/aqi-home-v2-production`, obtain the Cloudflare preview comment/URL for the new HEAD, and verify PR #51 remains open and draft.

- [ ] **Step 4: Commit any final documentation only if required**

Do not add unrelated files or alter the visual lab route.
