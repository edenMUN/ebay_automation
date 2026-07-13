# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

End-to-end UI automation of a single eBay shopping flow: **login → search under a max price (with paging) → add items to cart (handling variants) → assert cart subtotal ≤ `budget_per_item * items_count`**. Playwright (sync Python) + Pytest + Page Object Model + Allure.

## Commands

```powershell
# Setup
python -m pip install -r requirements.txt
python -m playwright install

# Run the single e2e test (always prefer --headed locally; eBay gates login with captcha)
python -m pytest src/tests/Test_e2e_add_to_cart.py -v --browser chromium --headed

# Unified runner: runs pytest with --alluredir, then `allure serve` locally (skipped when CI env is set)
python run_tests.py --browser chromium --headed
python run_tests.py --trace-on --browser chromium --headed   # adds Playwright trace, attaches to Allure

# Environment data selection (default -> data/data.json; other -> data/data.<env>.json + optional .env.<env>)
python -m pytest src/tests/Test_e2e_add_to_cart.py --env staging --headed

# Markers
python -m pytest -m regression -v      # also: sanity, logic

# View a trace / archived report
playwright show-trace results/<test_name>_trace.zip
allure serve allure-results
```

Requires the **Allure CLI** on PATH (`choco install allure`) and Java for local report serving.

## Architecture

- **One test** drives the whole business flow and owns all assertions: `src/tests/Test_e2e_add_to_cart.py`. Page objects stay lean (locators + actions only); business logic like budget math lives in the test/utils.
- **Page objects** in `src/pages/` (`base_page`, `login_page`, `search_page`, `product_page`, `cart_page`) extend `BasePage`. Every public action is decorated with `@allure.step`. Use `expect()`/`locator.wait_for()` — **never `time.sleep()`**.
- **`src/tests/conftest.py`** is the central hub:
  - `pytest_sessionstart` **deletes and recreates `results/` and `allure-results/` on every run** — triage existing artifacts *before* re-running, or they are lost.
  - `browser_context_args` injects `viewport` + `locale` from test data.
  - Autouse fixture `clear_cart_before_each_test` performs **login + cart cleanup before each test, retrying once**; if eBay's anti-bot/captcha blocks it, the test is **skipped (not failed)**. There is no guest fallback.
  - `pages` fixture injects initialized page objects; `traced_page` starts tracing only under `--trace-on`.
  - `pytest_runtest_makereport` attaches a full-page failure screenshot to Allure.
- **Utilities** in `src/utils/`: `config_loader` (loads JSON, overlays `.env` credentials), `price_parser`, `currency_converter` (**static FX rates by design**, not live), `exceptions.AutomationStepError` (raised for business-critical step failures).

## Conventions & gotchas

- **Credentials come from `.env`** (`EBAY_USERNAME`, `EBAY_PASSWORD`), never committed JSON. `data/data.json` holds query/budget/locale/viewport.
- **Locale vs currency mismatch is a known trap:** `data/data.json` uses `locale: he-IL` against `ebay.com`, and `budget.currency` (e.g. `ILS`) may differ from displayed prices — `currency_converter` bridges them. When a budget assertion fails, check locale + currency together before touching locators.
- **Import style is inconsistent across files** (`from src.pages...` in some, `from pages...` in others; `pythonpath = src` in `pytest.ini` makes both resolve). Match the style of the file you edit.
- eBay DOM is fragile; `search_page.py` already carries intentional locator fallbacks (`.or_`-style role/label/CSS chains). Preserve them.
- `data/data.json` uses `search.max_price` / `search.limit` / `budget.per_item` / `budget.currency` keys.

## Project skills (Cursor) — failure triage & locator healing

Custom skills in `.cursor/skills/` (mirrored as slash commands in `claudecode.config.json`) define the intended workflow for test failures:

- **failure-triage-agent** — classify a failure from artifacts *without editing code*. Categories: ANTI-BOT/CAPTCHA, SETUP SKIP, LOCATOR TIMEOUT, ASSERTION (zero results / none added), DATA/CURRENCY, PRICE PARSE, ENVIRONMENT/AUTH, FLAKY. Read artifacts before re-running (session start wipes them).
- **ebay-locator-healer** — fix **only** the one broken locator in `src/pages/` (no new fallbacks, no unrelated edits), verified live via Playwright MCP in headed mode. Only for LOCATOR TIMEOUT / locator-related `AutomationStepError` — stop for captcha/currency/data failures.

When triaging or fixing a Playwright test failure, follow these skills. Fix only what failed; do not refactor `conftest.py`, tests, or budget/currency logic during a locator heal.
