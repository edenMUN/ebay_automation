# Failure Triage Agent — Examples

Worked scenarios for this project. **Triage classifies and routes** — it does not apply fixes unless the user asks to proceed after triage.

---

## Example 1 — Locator timeout (route to locator healer)

**User message:**
> `test_ebay_login_search_add_and_validate_budget` failed — timeout on search combobox.

**Evidence collected:**

- Terminal: `TimeoutError: waiting for get_by_role("combobox", name="Search for something")`
- Allure last passed step: `Prepare test parameters`
- Failing step: `Search for items under maximum price` → `SearchPage.search`
- Screenshot: `results/test_ebay_login_search_add_and_validate_budget_failure.png` — home page loaded, search box visible

**Classification:** **LOCATOR TIMEOUT** (primary)

**Triage summary:**

```markdown
## Failure triage summary

**Test:** src/tests/Test_e2e_add_to_cart.py::test_ebay_login_search_add_and_validate_budget
**Failing step:** Search for items under maximum price / SearchPage.search
**Primary category:** LOCATOR TIMEOUT
**Evidence:** Playwright call log names combobox "Search for something"; screenshot shows header loaded

**Root cause (likely):** Stale accessible name on search combobox — DOM no longer matches page object.

**Recommended next step:**
- Hand off to @ebay-locator-healer with exact locator from call log; patch only `SearchPage.search_input`

**Do not:** Change test assertions, budget data, or conftest login fixture
```

---

## Example 2 — Anti-bot / captcha (user action required)

**User message:**
> Test failed during search with "anti-bot challenge still active".

**Evidence collected:**

- Error: `AutomationStepError: eBay anti-bot challenge is still active after smart wait`
- Trace URL at failure: `https://www.ebay.com/splashui/challenge?...`
- Screenshot: eBay security check UI

**Classification:** **ANTI-BOT / CAPTCHA**

**Triage summary:**

```markdown
## Failure triage summary

**Test:** test_ebay_login_search_add_and_validate_budget
**Failing step:** SearchPage.search / _wait_out_search_challenge
**Primary category:** ANTI-BOT / CAPTCHA
**Evidence:** Trace on /splashui/challenge; error from SearchPage smart wait

**Root cause (likely):** eBay gated the session — not a selector bug.

**Recommended next step:**
- Rerun headed: `python run_tests.py --browser chromium --headed`
- Complete captcha manually when console prints security challenge warning
- Retry once; do not edit locators for this failure mode

**Do not:** Invoke locator healer or change wait logic without user request
```

---

## Example 3 — Setup skip (not an assertion failure)

**User message:**
> Pytest says SKIPPED — "Setup blocked by eBay security/cart transient issue".

**Evidence collected:**

- Status: `SKIPPED` in setup phase
- Stack: `conftest.py` → `clear_cart_before_each_test` → `pytest.skip(...)`
- No failure screenshot for test body (setup never completed)

**Classification:** **SETUP SKIP** (primary: login/captcha/cart transient)

**Triage summary:**

```markdown
## Failure triage summary

**Test:** test_ebay_login_search_add_and_validate_budget
**Failing step:** Setup (autouse clear_cart_before_each_test)
**Primary category:** SETUP SKIP
**Evidence:** pytest.skip after 2 login/cart attempts in conftest

**Root cause (likely):** Login or cart cleanup blocked — captcha, bad credentials, or transient cart UI.

**Recommended next step:**
- Verify `.env` credentials used by `test_data["credentials"]`
- Run headed and watch login + cart clear
- Check `results/login_security_challenge_failure.png` if login raised challenge

**Do not:** Treat as search or budget assertion failure; test body did not run
```

---

## Example 4 — Currency / budget mismatch

**User message:**
> Cart assertion failed — subtotal exceeds threshold.

**Evidence collected:**

- Assertion: `Cart subtotal 42.50 USD (155.20 ILS) exceeds threshold 105.00 ILS`
- Allure step: `Verify cart subtotal is within budget`
- `data/data.json`: `"budget": { "per_item": 35, "currency": "ILS" }`, `"locale": "he-IL"`
- Screenshot: cart shows USD subtotal

**Classification:** **DATA / CURRENCY**

**Triage summary:**

```markdown
## Failure triage summary

**Test:** test_ebay_login_search_add_and_validate_budget
**Failing step:** Verify cart subtotal is within budget / CartPage.assert_cart_total_not_exceeds
**Primary category:** DATA / CURRENCY
**Evidence:** Assertion shows USD display converted to ILS above threshold

**Root cause (likely):** Items added exceed per-item budget after conversion, or budget/locale/currency config does not match shopping session.

**Recommended next step:**
- Review `budget.per_item`, `budget.currency`, and `search.max_price` in `data/data.json`
- Confirm whether failure is config (threshold too low) or conversion (`utils/currency_converter.py`)
- Lower max price or raise budget if data is intentional; fix converter only if parse/rate is wrong

**Do not:** Route to locator healer — cart subtotal was found and parsed
```

---

## Example 5 — Zero search results

**User message:**
> `assert len(item_urls) > 0` — Search for 'wireless mouse' returned 0 results.

**Evidence collected:**

- Failure in test body, step `Search for items under maximum price`
- Screenshot: SRP loaded but "0 results" or empty results list
- No Playwright timeout — search flow completed

**Classification:** **ASSERTION — ZERO RESULTS**

**Triage summary:**

```markdown
## Failure triage summary

**Test:** test_ebay_login_search_add_and_validate_budget
**Failing step:** Search for items under maximum price
**Primary category:** ASSERTION — ZERO RESULTS
**Evidence:** Assertion in Test_e2e_add_to_cart.py line 35; search completed without timeout

**Root cause (likely):** Query + max_price filter too strict, price filter not applied, or result card locators return empty list.

**Recommended next step:**
- Check `search.query`, `search.max_price`, `search.limit` in data.json
- In screenshot/trace: confirm price filter chip and result cards visible
- If filter OK but 0 cards matched → locator issue on `SearchPage.result_cards` → locator healer
- If filter not applied → `SearchPage.apply_max_price_filter` logic/locators

**Do not:** Change budget or cart code — failure is upstream in search
```

---

## Example 6 — AutomationStepError on add to cart

**User message:**
> `AutomationStepError: Add to cart button not found on the current item page.`

**Evidence collected:**

- Stack: `product_page.py` → `add_items_to_cart`
- Screenshot: product page open, possibly variant selector or different CTA label
- Prior step collected item URLs from search

**Classification:** **AUTOMATION STEP** → likely **LOCATOR TIMEOUT** on product page

**Triage summary:**

```markdown
## Failure triage summary

**Test:** test_ebay_login_search_add_and_validate_budget
**Failing step:** Add selected items to cart
**Primary category:** AUTOMATION STEP (locator-related)
**Evidence:** AutomationStepError from ProductPage when CTA not found

**Root cause (likely):** Add-to-cart control locator stale or variant selection required before CTA appears.

**Recommended next step:**
- Hand off to @ebay-locator-healer for `ProductPage.add_to_cart_button` (only if named in failure path)
- Inspect screenshot for variant dropdown / "See details" vs "Add to cart"

**Do not:** Lower search limit or change budget to mask add-to-cart failure
```

---

## Example 7 — Price parser failure

**User message:**
> `ValueError` from `parse_price_to_float` during cart or search.

**Evidence collected:**

- Stack: `utils/price_parser.py`
- Raw text in trace or log: unexpected currency format or multi-line price

**Classification:** **PRICE PARSE**

**Triage summary:**

```markdown
## Failure triage summary

**Test:** test_ebay_login_search_add_and_validate_budget
**Failing step:** [step that called parse_price_to_float]
**Primary category:** PRICE PARSE
**Evidence:** ValueError in price_parser with raw UI string

**Recommended next step:**
- Capture exact price string from screenshot or trace
- Fix `utils/price_parser.py` for that format only

**Do not:** Change cart assertion thresholds to hide parse errors
```

---

## Bad triage — fixing before classifying

**Symptom:** Agent immediately edits `SearchPage`, `ProductPage`, and `conftest.py` after a single timeout.

**Why bad:** Category unknown; may be captcha or setup skip; violates minimal-change principle.

**Correct approach:** Run Steps 1–3 from SKILL.md, report triage summary, then one targeted handoff.

---

## Bad triage — healing locators for currency failure

**Symptom:** Cart assertion mentions ILS threshold; agent updates `CartPage.subtotal_locator`.

**Why bad:** Subtotal was read successfully; failure is budget math or data, not missing element.

**Correct approach:** Category **DATA / CURRENCY** — inspect `data.json` and `currency_converter.py`.

---

## Invocation examples (user prompts)

```
@failure-triage-agent Test failed locally — triage from allure-results and tell me what to fix.
```

```
@failure-triage-agent Pytest skipped with "Setup blocked by eBay security" — what happened?
```

```
@failure-triage-agent Here's the traceback: [paste]. Classify and route to the right skill.
```

```
@failure-triage-agent Cart subtotal assertion failed — is this locators or budget/currency?
```

---

## After triage — typical handoffs

| Triage result | Next skill / action |
|---------------|---------------------|
| LOCATOR TIMEOUT | `@ebay-locator-healer` with exact locator |
| ANTI-BOT / SETUP SKIP | User headed rerun + captcha |
| DATA / CURRENCY | Edit `data/data.json` or `utils/currency_converter.py` |
| PRICE PARSE | Edit `utils/price_parser.py` |
| Code quality during fix | `@python-code-quality` |
