# Code Quality Examples

Patterns aligned with `src/pages/`, `src/utils/`, and `src/tests/`.

---

## Method design

### Good — focused public method with private helpers

```python
@allure.step("Add items to cart from collected URLs")
def add_items_to_cart(self, urls: List[str], search_page_url: str) -> int:
    if not urls:
        return 0
    added_count = 0
    for item_index, url in enumerate(urls, start=1):
        # per-item try/continue at loop boundary only
        ...
    return added_count

def _click_add_to_cart_once(self) -> None:
    if self.add_to_cart_button.count() == 0:
        raise AutomationStepError("Add to cart button not found on the current item page.")
    ...
```

Why: public method orchestrates; helpers handle DOM details; return type documents outcome (`int` added).

### Bad — god method mixing layers

```python
def add_and_validate_cart(self, urls, budget, test_data):
    threshold = budget * len(urls)  # business math in page object
    for url in urls:
        try:
            self.page.goto(url)
            # 80 lines of locator logic, parsing, assert...
        except:
            pass
    assert subtotal <= threshold
```

Why: mixes test data, budget logic, DOM, and assertions in one place.

---

## Error handling

### Good — fail fast on critical step

```python
def _click_add_to_cart_once(self) -> None:
    if self.add_to_cart_button.count() == 0:
        raise AutomationStepError("Add to cart button not found on the current item page.")
    try:
        self.add_to_cart_button.click(timeout=10000)
    except Exception:
        self.add_to_cart_button.click(timeout=10000, force=True)
```

Why: missing button is fatal; click failure gets one fallback, then propagates.

### Good — skip item in batch, keep suite stable

```python
for item_index, url in enumerate(urls, start=1):
    try:
        self.goto(url)
        self._handle_item_customizations()
        self._click_add_to_cart_once()
        self._assert_added_to_cart()
        added_count += 1
    except Exception as item_error:
        print(f"[!] Skipping item (could not add): {url} | reason: {item_error}")
        try:
            self.page.screenshot(path=f"results/item_{item_index}_failed.png", full_page=True)
        except Exception:
            pass
```

Why: one bad listing must not abort the entire cart flow; evidence is captured.

### Bad — silent swallow

```python
def login(self, user, password):
    try:
        self.fill(self.username, user)
        self.fill(self.password, password)
        self.click(self.submit)
    except Exception:
        return False
```

Why: hides Playwright timeouts, wrong selectors, and captcha with no message or screenshot.

### Good — utility raises on bad input

```python
def parse_price_to_float(raw_price: str) -> float:
    if not raw_price:
        raise ValueError("Cannot parse empty price string")
    ...
    if not cleaned:
        raise ValueError(f"Could not parse price from: {raw_price}")
    return float(cleaned)
```

Why: pure function; caller decides how to handle `ValueError`.

---

## Assertions

### Good — assertion message with context

```python
assert subtotal_in_budget_currency <= threshold, (
    f"Cart subtotal {subtotal_value:.2f} {subtotal_currency} "
    f"({subtotal_in_budget_currency:.2f} {budget_currency}) "
    f"exceeds threshold {threshold:.2f} {budget_currency}"
)
```

### Good — test-layer business assertion

```python
assert added_items_count > 0, (
    f"Items were found but NONE could be added to cart. "
    f"This might indicate missing 'Add to Cart' buttons or Selector issues."
)
```

Why: test owns pass/fail on business outcome; page object returns `added_count`.

---

## Locators and helpers

### Good — descriptive locator names, chained fallbacks

```python
self.add_to_cart_button = (
    self.page.get_by_role("button", name=re.compile(r"add to (cart|basket)", re.IGNORECASE))
    .or_(self.page.locator("#atcBtn_btn_1"))
    .first
)
```

### Good — delegate parsing to utils

```python
subtotal_value = parse_price_to_float(subtotal_text)
subtotal_currency = extract_currency_code(subtotal_text) or budget_currency
subtotal_in_budget_currency = convert_amount(
    subtotal_value, from_currency=subtotal_currency, to_currency=budget_currency
)
```

### Bad — inline regex parsing in page object

```python
subtotal = float(self.subtotal_locator.inner_text().replace("$", "").replace(",", ""))
```

Why: duplicates logic, breaks on €/£/₪ and European formats.
