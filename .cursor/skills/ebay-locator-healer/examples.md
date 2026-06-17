# eBay Locator Healer — Examples

Minimal heal examples for this project. **During a heal, change only the failing locator** — do not add fallbacks or touch unrelated locators.

---

## Good heal — single value fix

**Failure:** `waiting for get_by_role("combobox", name="Search for something")`

**MCP snapshot shows:** `combobox "Search for anything"`

**Patch (only this line):**

```python
self.search_input = self.page.get_by_role("combobox", name="Search for anything")
```

**Do not:**
- Add `.or_(...)` fallbacks
- Change `search_button` or other locators in the same file
- Broaden to regex when a plain name works

---

## Good heal — one attribute in an existing locator

**Failure:** `get_by_role("textbox", name="Maximum value")` timeout

**MCP snapshot shows:** textbox accessible name is `"Max price"`

**Patch (only the failing locator):**

```python
self.max_price_input_by_role = self.page.get_by_role("textbox", name="Max price")
```

If the failure log points to `max_price_input_by_role`, fix **that** definition only — not `max_price_input_by_label` or CSS fallbacks unless they also failed.

---

## Good heal — verification locator

**Failure:** click on add-to-cart succeeds, but `added_to_cart_confirmation` times out.

**Heal action:** Fix **only** `added_to_cart_confirmation` (or `see_in_cart` if that is the one in the call log). Do not change `add_to_cart_button`.

---

## MCP inspection workflow (example session)

**User message:**
> Test failed on `search` — timeout waiting for combobox "Search for something".

**Agent steps:**

1. Read failure call log — identify exact locator: `combobox`, name `"Search for something"`
2. MCP: `browser_navigate` → `https://www.ebay.com`
3. MCP: `browser_snapshot` on header search area
4. Find combobox: `name: "Search for anything"`
5. Patch **one line** in `SearchPage.__init__`:

```python
self.search_input = self.page.get_by_role("combobox", name="Search for anything")
```

6. User runs: `python run_tests.py --browser chromium --headed`

---

## Bad heal — scope creep

```python
# User asked to fix search_input only — do NOT do this
self.search_input = (
    self.page.get_by_role("combobox", name="Search for anything")
    .or_(self.page.locator("#gh-ac"))
    .first
)
self.search_button = self.page.get_by_role("button", name=re.compile(r"search", re.I)).first
```

**Why:** Adds fallbacks and changes locators that did not fail.

---

## Existing patterns in codebase (do not expand during heal)

The repo may already contain fallback chains (e.g. `ProductPage.add_to_cart_button`, `SearchPage.apply_max_price_filter` probe loop). **Leave them unchanged** unless the failure log names that specific locator. A heal is not a refactor opportunity.

---

## What not to heal

| Symptom | Real owner | Action |
|---------|------------|--------|
| `pytest.skip` on login setup | Captcha / anti-bot | Headed run + manual captcha; not a selector fix |
| Cart subtotal > budget | `currency_converter` / test data | Check `budget.currency` in `data.json` |
| 0 search results | Query or filter logic | Check `search.query` / `max_price`, not just locators |
| `ValueError` from `parse_price_to_float` | `utils/price_parser.py` | Fix price text parsing, not page click |

---

## Invocation examples (user prompts)

```
@ebay-locator-healer Test failed: SearchPage.search timeout on combobox "Search for something". Heal locators.
```

```
@ebay-locator-healer Use Playwright MCP to fix add-to-cart confirmation locators in ProductPage.
```

```
@ebay-locator-healer Review CartPage.subtotal_locator — subtotal not found after eBay UI update.
```
