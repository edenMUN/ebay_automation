---
name: python-code-quality
description: >-
  Applies standards for writing methods, error handling, and maintainable Python
  in this Playwright automation project. Use when implementing or refactoring
  functions, adding try/except blocks, designing page object methods, or when
  the user asks for professional, production-quality, or clean code.
---

# Python Code Quality (N-ebay_task)

Complements [UI_Automation.mdc](../../rules/UI_Automation.mdc) with method design and error-handling rules. Read that rule for POM architecture, Allure, and eBay-specific flows.

## Before writing code

1. Read surrounding files — match naming, imports, and patterns already in `src/`.
2. Prefer the smallest correct change; do not refactor unrelated code.
3. Keep page objects lean: locators + actions only; business thresholds and orchestration stay in tests or `utils/`.

## Method design

### Signatures

- Type-hint every parameter and return value (`-> None`, `-> int`, `-> list[str]`).
- Use descriptive verb names: `assert_cart_total_not_exceeds`, `_select_first_from_native_select`.
- Prefix private helpers with `_`; public API methods stay unprefixed.

### Size and responsibility

- One responsibility per method. Extract when a method does setup + action + verification + reporting.
- Public page-object methods: user-facing actions decorated with `@allure.step("Human-readable step")`.
- Private helpers: DOM probing, variant selection, retry logic — keep them `_`-prefixed and step-free.

### Layer boundaries

| Layer | Owns | Does not own |
|-------|------|--------------|
| `pages/` | Navigation, clicks, waits, locators, per-step UI verification | Budget math, test data loading, pytest assertions on business outcomes |
| `utils/` | Pure helpers (`parse_price_to_float`, currency conversion, config) | Playwright `Page` interactions |
| `tests/` | Flow orchestration, hard assertions on business results | Low-level locator logic |

### Waits and synchronization

- Use `expect()`, `locator.wait_for()`, and `BasePage.click` / `wait_visible` — not `time.sleep()`.
- `page.wait_for_timeout()` is acceptable only for known DOM re-renders (e.g. after variant selection) with a short inline comment explaining why.

## Error handling

### When to raise

Raise `AutomationStepError` (from `src.utils.exceptions`) when a **business-critical step cannot continue**:

- Required control missing (e.g. Add to Cart button not found)
- Verification failed after a user action (e.g. cart addition not confirmed)

```python
from src.utils.exceptions import AutomationStepError

raise AutomationStepError("Add to cart button not found on the current item page.")
```

Use `ValueError` in pure `utils/` when input data is invalid (see `parse_price_to_float`).

### When to catch and continue

Catch broadly only at **iteration boundaries** where skipping one item must not abort the whole flow:

- Loop over product URLs — log failure, screenshot, continue to next URL
- Cart cleanup setup — skip a stubborn row rather than fail the entire suite
- Optional UI paths (Escape to close listbox, force-click fallback)

### When not to catch

- Do not wrap entire public methods in `try/except Exception` that swallows the real failure.
- Do not use bare `except:`.
- Do not catch just to re-raise without adding context.

### Catch pattern for Playwright fallbacks

Try the preferred path; on failure, attempt one documented fallback; then raise a clear error:

```python
try:
    expect(self.added_to_cart_confirmation).to_be_visible(timeout=12000)
    return
except Exception:
    if self.see_in_cart.count() and self.see_in_cart.is_visible():
        return
    raise AutomationStepError("Could not verify cart addition after clicking 'Add to cart'.")
```

### Error messages

- State **what failed**, **where** (page/step), and **what was expected**.
- Assertion messages include actual vs expected values and units/currency.

## Reporting hooks

- Decorate public page-object actions with `@allure.step`.
- Attach screenshots on meaningful outcomes (item added, cart validation) via `allure.attach.file`.
- Save artifacts under `results/` with stable, descriptive names (`item_{index}_added.png`).

## Quick checklist

Before finishing a method:

- [ ] Type hints on signature
- [ ] Name reflects a single responsibility
- [ ] Critical failures use `AutomationStepError` or pytest `assert` with a clear message
- [ ] Broad catches are only at skip/continue boundaries, with logging
- [ ] No `time.sleep()`; waits are Playwright-native
- [ ] Price/currency parsing delegated to `utils/`, not inlined
- [ ] Public page method has `@allure.step` if it is a test-visible action

## Examples

See [examples.md](examples.md) for good vs bad patterns from this project.
