---
name: ebay-locator-healer
description: >-
  Diagnoses and fixes broken Playwright locators in eBay page objects using
  live DOM inspection via Playwright MCP. Use when a test fails on a timeout
  or AutomationStepError, when the user mentions locator/selector healing,
  stale selectors, or eBay DOM changes, or when updating src/pages/*.py
  locators.
---

# eBay Locator Healer (N-ebay_task)

Complements [UI_Automation.mdc](../../rules/UI_Automation.mdc) and [python-code-quality](../python-code-quality/SKILL.md). This skill fixes **locators and waits only** in `src/pages/` — never business assertions, budget math, or test data.

## Healing principle (strict)

**Fix only what failed. Change only the broken locator value.**

- Triage to the **exact** locator named in the timeout / call log (e.g. `get_by_role("combobox", name="Search for something")`).
- Use MCP to find the **current** accessible name, role, or selector for **that one control**.
- Patch **only** that locator line — update the stale name/role/selector to match live DOM.
- Do **not** add fallback chains, `.or_()` candidates, probe loops, or regex broadening during a heal.
- Do **not** change other locators in the same file that did not fail.
- Do **not** refactor surrounding code, imports, or methods.

Existing fallbacks already in the codebase stay as-is unless they are the ones that failed.

## When to use

- Pytest fails with Playwright timeout, `AutomationStepError`, or "element not found"
- Allure step names a specific page method (e.g. `Apply maximum price filter`, `Add to cart`)
- eBay changed DOM and a locator no longer matches
- User asks to heal, fix, or update selectors/locators

## Prerequisites

- Playwright MCP enabled (`.cursor/mcp.json` → `playwright` server)
- Test data locale from `data/data.json` (currently may be `he-IL`) — heal against the **same locale** the suite uses
- For login-gated steps: run in **headed** mode; user may need to resolve captcha manually

## Healing workflow

Copy this checklist and track progress:

```
Locator heal progress:
- [ ] Step 1: Triage failure (page, method, exact locator)
- [ ] Step 2: Gather evidence (trace, screenshot, error text)
- [ ] Step 3: Reproduce on live eBay via Playwright MCP
- [ ] Step 4: Read current value for the failing control only
- [ ] Step 5: Patch that one locator (no fallbacks, no unrelated edits)
- [ ] Step 6: Verify with headed pytest run
```

### Step 1 — Triage

1. Read the failure output: which `@allure.step` or stack frame points to `src/pages/`?
2. Map to exactly one page class: `LoginPage`, `SearchPage`, `ProductPage`, or `CartPage`.
3. Copy the **exact** failing locator from the call log (role, name, selector).
4. Do **not** change `tests/`, `utils/`, or `conftest.py` unless the failure is clearly not locator-related.

### Step 2 — Gather evidence

Check in order:

| Source | Path / command |
|--------|----------------|
| Failure screenshot | `results/<test_name>_failure.png` |
| Allure step | Last passing step before timeout |
| Trace (if enabled) | `results/<test_name>_trace.zip` → `playwright show-trace ...` |
| Past MCP snapshots | `.playwright-mcp/page-*.yml` |

Note the URL, locale, and UI state at failure (search results, product page, cart, challenge page).

### Step 3 — Reproduce with Playwright MCP

1. Read Playwright MCP tool schemas before calling tools.
2. Navigate to `base_url` from `data/data.json` (default `https://www.ebay.com`).
3. Replay user actions up to the failing step:
   - **Search flow:** search → apply max price → collect results
   - **Product flow:** open item URL → variants → add to cart
   - **Cart flow:** open cart → read subtotal / remove items
4. If `/splashui/challenge` appears: pause and tell the user to resolve captcha in the browser (same as `_wait_out_search_challenge` in `SearchPage`).
5. Call `browser_snapshot` at the failure point; optionally `browser_take_screenshot`.

### Step 4 — Read the correct value

Inspect **only** the failing control in the snapshot:

1. Prefer `get_by_role` with the current accessible name.
2. If role/label unavailable, use the stable `data-test-id` or id already used in the project for that control.
3. Record the single replacement value — do not design a fallback list.

### Step 5 — Patch

1. Edit only the affected `src/pages/<page>.py` file.
2. Change **one locator** (the one that failed) to the value from Step 4.
3. Match existing import style (`from src.pages.base_page` vs `from pages.base_page` — follow the file you edit).
4. Keep type hints and `@allure.step` on public methods unchanged.
5. No new comments unless the DOM change is non-obvious.

**Forbidden during a heal:**

- Adding `.or_()`, fallback loops, or extra candidates
- Changing locators that did not appear in the failure
- `time.sleep()`
- Business logic or price parsing in page objects
- Hardcoded credentials or test data in locators

### Step 6 — Verify

Run headed (captcha may require manual step):

```powershell
python run_tests.py --browser chromium --headed
```

Or target the flow:

```powershell
python -m pytest src/tests/Test_e2e_add_to_cart.py -v --browser chromium --headed
```

If only one page was healed, user may stop after that step passes — do not require full e2e if budget/cart unrelated.

**Done when:** the previously failing step passes in a headed run, or user confirms captcha blocked verification and accepts the locator patch pending manual test.

## Page-specific hints

| Page | Fragile areas | MCP navigation tip |
|------|---------------|-------------------|
| `SearchPage` | Price filter sidebar, result cards, pagination | Search `wireless mouse`, set max price from `data.json` |
| `ProductPage` | Add-to-cart button, confirmation drawer, variant dropdowns | Open a search result URL |
| `CartPage` | Subtotal `data-test-id='SUBTOTAL'`, remove buttons | Navigate via cart link after adding an item |
| `LoginPage` | Sign-in form, post-login indicator | Requires `.env` credentials; captcha likely |

## Output format

After healing, report:

```markdown
## Locator heal summary

**Failure:** [step / error]
**Page:** [SearchPage.search_input]
**Root cause:** [e.g. accessible name is "Search for anything", not "Search for something"]

**Changes:**
- `search_input`: name `"Search for something"` → `"Search for anything"`

**Verify:** `python run_tests.py --browser chromium --headed`
```

## Escalation

Stop and ask the user when:

- Failure is captcha/login — not a locator issue
- Failure is currency/budget mismatch — `utils/currency_converter.py`, not locators
- Multiple pages fail at once — likely eBay A/B layout or locale; confirm `locale` in `data/data.json`
- Playwright MCP unavailable — cannot heal live; propose the single corrected value from snapshot files only

## Additional resources

- Good vs bad locator patterns: [examples.md](examples.md)
- Method/error standards: [python-code-quality](../python-code-quality/SKILL.md)
