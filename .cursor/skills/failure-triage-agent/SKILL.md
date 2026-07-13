---
name: failure-triage-agent
description: >-
  Diagnoses pytest and Playwright automation failures by analyzing local
  execution artifacts (Allure results, failure screenshots, traces, and
  terminal output). Use when a test fails, skips, or flakes; when the user
  pastes a pytest traceback; when triaging CI or local run results; or
  before invoking ebay-locator-healer or other fix skills.
---

# Failure Triage Agent (N-ebay_task)

First step for any failed run. **Classify the failure and route to the right fix** — do not patch code until evidence is collected and the category is clear.

Complements [UI_Automation.mdc](../../rules/UI_Automation.mdc), [ebay-locator-healer](../ebay-locator-healer/SKILL.md), and [python-code-quality](../python-code-quality/SKILL.md).

## When to use

- User reports a failed, skipped, or flaky pytest run
- User pastes pytest output, Allure step name, or Playwright call log
- User asks "why did this test fail?" or "what should I fix?"
- Before healing locators — confirm the failure is locator-related
- After `python run_tests.py` or `pytest` exits non-zero

## Prerequisites

- A test has already run locally (artifacts are recreated each session — see `conftest.py`)
- Repo root: `c:\Git_repos\N-ebay_task` (or equivalent clone path)
- Optional but valuable: rerun with `--trace-on` for Playwright traces

## Triage principle (strict)

1. **Collect evidence before suggesting fixes.**
2. **Classify into one primary category** (secondary tags allowed).
3. **Route to the owning layer** — page locators, test data, utils, environment, or user action.
4. **Do not refactor** framework structure, conftest, or unrelated files during triage.

## Triage workflow

Copy this checklist and track progress:

```
Failure triage progress:
- [ ] Step 1: Collect evidence (terminal, Allure, screenshot, trace)
- [ ] Step 2: Identify failing step and stack frame
- [ ] Step 3: Classify failure category
- [ ] Step 4: Route to action plan (skill, file, or user)
- [ ] Step 5: Report triage summary to user
```

### Step 1 — Collect evidence

Gather in this order (stop early only if category is already unambiguous):

| Priority | Source | Where / how |
|----------|--------|-------------|
| 1 | Terminal output | User paste, or `terminals/*.txt` if a recent run exists |
| 2 | Allure results | `allure-results/*-result.json` with `"status": "failed"` or `"broken"` |
| 3 | Failure screenshot | `results/<test_name>_failure.png` |
| 4 | Playwright trace | `results/<test_name>_trace.zip` (only if run used `--trace-on`) |
| 5 | Allure attachments | Same run folder — PNG/ZIP linked from result JSON |
| 6 | MCP snapshots | `.playwright-mcp/page-*.yml` if a prior MCP session exists |

**Allure tips:**

- Session start clears `allure-results/` and `results/` — artifacts reflect the **latest** run only.
- Sort `*-result.json` by modification time; read the newest failed entry.
- Extract `name`, `statusDetails.message`, `statusDetails.trace`, and `steps` (last `passed` step before failure).
- Open report locally: `allure serve allure-results` (or via `run_tests.py` on non-CI runs).

**Trace tips:**

```powershell
playwright show-trace results\test_ebay_login_search_add_and_validate_budget_trace.zip
```

Look at URL at failure time, last action, and network/navigation to `/splashui/challenge`.

### Step 2 — Identify the failing step

Map the failure to a single anchor:

| Anchor | How to find it |
|--------|----------------|
| Allure step | Last passing `with allure.step(...)` before timeout/assert |
| Pytest phase | `setup` / `call` / `teardown` — cart/login failures are often in `setup` (autouse fixture) |
| Stack frame | First project frame in `src/pages/`, `src/tests/`, or `src/utils/` |
| Playwright call log | `waiting for get_by_role(...)` or `locator.click` timeout |

**Project test:** `src/tests/Test_e2e_add_to_cart.py::test_ebay_login_search_add_and_validate_budget`

**Autouse setup:** `clear_cart_before_each_test` in `conftest.py` — login + cart clear before every test.

### Step 3 — Classify the failure

Pick the **primary** category:

| Category | Signals | Typical owner |
|----------|---------|---------------|
| **ANTI-BOT / CAPTCHA** | URL `/splashui/challenge`; security-check screenshot; `AutomationStepError` mentioning anti-bot; login challenge screenshot `results/login_security_challenge_failure.png` | User — headed run + manual captcha |
| **SETUP SKIP** | `pytest.skip` with message about "Setup blocked by eBay security/cart transient issue" | Often ANTI-BOT or login — not a test assertion failure |
| **LOCATOR TIMEOUT** | `Playwright TimeoutError`, `waiting for locator(...)`, timeout on `@allure.step` in `src/pages/` | [ebay-locator-healer](../ebay-locator-healer/SKILL.md) |
| **AUTOMATION STEP** | `AutomationStepError` with business message (e.g. add-to-cart not verified, 0 results after filter) | Page object logic **or** locator — read message; locator if DOM missing |
| **ASSERTION — ZERO RESULTS** | `assert len(item_urls) > 0` or "returned 0 results" | Search query, `max_price`, filters, or locators for result cards |
| **ASSERTION — NONE ADDED** | `added_items_count > 0` assertion failed | `ProductPage` locators or item URLs stale |
| **DATA / CURRENCY** | Cart subtotal exceeds threshold; `ILS` vs `USD` in assertion message; `convert_amount` / `extract_currency_code` in trace | `data/data.json` (`budget.currency`, `locale`) or `utils/currency_converter.py` |
| **PRICE PARSE** | `ValueError` or failure inside `parse_price_to_float` | `utils/price_parser.py` |
| **ENVIRONMENT / AUTH** | Missing `.env` credentials; login never reaches password step; empty username/password | `.env` / `data/data.json` `credentials`, headed login |
| **FLAKY / TRANSIENT** | Passes on retry; intermittent network or eBay gate | Re-run headed; do not bulk-edit locators |

**Locale note:** `data/data.json` uses `"locale": "he-IL"` while `base_url` may be `ebay.com` — currency and labels can disagree with budget currency. Check locale + `budget.currency` together.

### Step 4 — Route to action plan

| Category | Action |
|----------|--------|
| **LOCATOR TIMEOUT** | Hand off to [ebay-locator-healer](../ebay-locator-healer/SKILL.md) with exact locator from call log |
| **ANTI-BOT / CAPTCHA** | Stop — ask user to run headed and resolve challenge; cite `_wait_out_search_challenge` / login flow |
| **SETUP SKIP** | Treat as setup/captcha/login; rerun `--headed`; verify `.env` credentials |
| **DATA / CURRENCY** | Compare `budget.currency`, displayed subtotal currency, and `locale`; adjust `data/data.json` or conversion in `utils/currency_converter.py` |
| **PRICE PARSE** | Inspect raw price text from screenshot/trace; fix `utils/price_parser.py` only if parsing is wrong |
| **ASSERTION — ZERO RESULTS** | Check `search.query`, `search.max_price`, price filter step; then locators if filter applied but 0 cards |
| **AUTOMATION STEP** | Read `AutomationStepError` message; if "not found" / timeout → locator healer; else page-method logic |
| **ENVIRONMENT / AUTH** | Verify `.env` keys and `test_data["credentials"]`; do not hardcode secrets in fixes |

**Do not during triage:**

- Edit multiple page objects "just in case"
- Change `conftest.py` unless failure is clearly in fixture logic
- Add `time.sleep()` or broad locator fallbacks
- Conflate skip with fail — skipped setup is not a broken assertion

### Step 5 — Report triage summary

Use this format:

```markdown
## Failure triage summary

**Test:** [node id]
**Failing step:** [Allure step or fixture phase]
**Primary category:** [category]
**Evidence:** [screenshot path, trace, key error line]

**Root cause (likely):** [one sentence]

**Recommended next step:**
- [specific action, skill, or file]

**Do not:** [common mis-routes, e.g. "do not heal locators for currency mismatch"]
```

## Quick reference — artifact paths

| Artifact | Path |
|----------|------|
| Allure raw results | `allure-results/` |
| Failure screenshot | `results/<test_name>_failure.png` |
| Playwright trace | `results/<test_name>_trace.zip` (requires `--trace-on`) |
| Test data | `data/data.json` or `data/data.<env>.json` |
| Main e2e test | `src/tests/Test_e2e_add_to_cart.py` |

## Useful rerun commands

```powershell
# Standard local run (Allure + serve)
python run_tests.py --browser chromium --headed

# With trace for deep triage
python run_tests.py --browser chromium --headed --trace-on

# Single test
python -m pytest src/tests/Test_e2e_add_to_cart.py -v --browser chromium --headed --trace-on
```

## Escalation — ask the user

- Captcha blocks headed run and failure is environment-related
- Multiple unrelated categories at once (e.g. login skip + cart assert) — confirm which run to trust
- No artifacts found — test may not have run or session was collect-only
- User wants a fix but category is ambiguous — present top two hypotheses with evidence

## Additional resources

- Worked triage scenarios: [examples.md](examples.md)
- Locator fixes after triage: [ebay-locator-healer](../ebay-locator-healer/SKILL.md)
- Code change standards: [python-code-quality](../python-code-quality/SKILL.md)
