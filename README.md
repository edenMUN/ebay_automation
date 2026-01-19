# ATID Store Playwright Test Suite

A comprehensive automated test suite for the ATID Store e-commerce website using Playwright with Page Object Model (POM) pattern.

## 🎯 Overview

This test suite covers 50 test cases across three categories:
- **Sanity Tests (10)**: Basic functionality verification
- **Logic Tests (20)**: Business workflows and complex interactions
- **Error Handling Tests (20)**: Edge cases and failure scenarios

## 📁 Project Structure

```
├── src/
│   ├── pages/                 # Page Object Model classes
│   │   ├── BasePage.ts        # Base page with common methods
│   │   ├── HomePage.ts        # Homepage interactions
│   │   ├── StorePage.ts       # Store page interactions
│   │   ├── ProductPage.ts     # Product page interactions
│   │   ├── CartPage.ts        # Cart page interactions
│   │   └── ContactPage.ts     # Contact page interactions
│   ├── tests/                 # Test files
│   │   ├── sanity-tests.spec.ts      # Sanity tests
│   │   ├── logic-tests.spec.ts       # Logic tests
│   │   └── error-handling-tests.spec.ts # Error handling tests
│   ├── utils/                 # Utility functions
│   └── config/                # Configuration files
├── test plans/                # Test plan documentation
├── playwright.config.ts       # Playwright configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atid-store-playwright-tests
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install-browsers
   ```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Tests by Category

**Sanity Tests Only:**
```bash
npm run test:sanity
```

**Logic Tests Only:**
```bash
npm run test:logic
```

**Error Handling Tests Only:**
```bash
npm run test:error
```

### Run Tests on Specific Browsers
```bash
# Chrome
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### Run Tests in Parallel
```bash
npx playwright test --workers=4
```

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

Reports are also generated in:
- `test-results/results.json` - JSON format
- `test-results/results.xml` - JUnit format

## 🏗️ Page Object Model

The test suite uses the Page Object Model pattern for better maintainability:

### BasePage
Common methods and utilities used across all pages:
- Navigation helpers
- Element interaction methods
- Assertion utilities
- Retry logic for flaky operations

### Page Classes
Each page has its own class with:
- Locators for page elements
- Methods for page-specific actions
- Verification methods
- Business logic encapsulation

## 🧪 Test Categories

### Sanity Tests (@sanity)
Basic functionality verification:
- Homepage loading
- Navigation menu functionality
- Store page access
- Product page access
- Shopping cart icon
- Search functionality
- Contact page
- Footer links
- Basic add to cart
- Accessibility features

### Logic Tests (@logic)
Business workflows and complex interactions:
- Product catalog filtering
- Price range filtering
- Product sorting
- Pagination
- Shopping cart calculations
- Quantity management
- Product removal
- Shipping options
- Coupon application
- Sale price display
- Product ratings
- Related products
- Best sellers
- Search relevance
- Breadcrumb navigation
- Image zoom
- Contact form submission
- Product tabs
- Out of stock handling
- Category counts

### Error Handling Tests (@error)
Edge cases and failure scenarios:
- Invalid search inputs
- Negative quantity values
- Large quantity values
- Empty form fields
- Invalid email formats
- Invalid coupon codes
- Price filter edge cases
- Network connectivity issues
- Session timeout handling
- Cross-browser compatibility
- Mobile responsiveness
- Missing product data
- Checkout interruption
- Multi-tab synchronization
- JavaScript disabled scenarios
- Accessibility toolbar errors
- URL manipulation security
- Form input length limits
- Cart persistence errors
- Race conditions

## 🔧 Configuration

### Playwright Config
The `playwright.config.ts` file includes:
- Multiple browser configurations
- Mobile device testing
- Parallel test execution
- Retry logic for CI
- Screenshot and video capture on failure
- Multiple reporters (HTML, JSON, JUnit)

### Environment Variables
Create a `.env` file for environment-specific settings:
```env
BASE_URL=https://atid.store
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

## 📱 Mobile Testing

The test suite includes mobile device testing:
- iPhone 12 (Mobile Safari)
- Pixel 5 (Mobile Chrome)
- Responsive design verification
- Touch interaction testing

## 🔍 Debugging

### Debug Mode
Run tests in debug mode to step through execution:
```bash
npm run test:debug
```

### Code Generation
Generate Playwright code for new interactions:
```bash
npm run codegen
```

### Trace Viewer
View detailed execution traces:
```bash
npx playwright show-trace trace.zip
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 📈 Test Metrics

Track test performance and reliability:
- Test execution time
- Pass/fail rates
- Flaky test identification
- Coverage reports

## 🛠️ Maintenance

### Adding New Tests
1. Create test in appropriate spec file
2. Add page methods if needed
3. Update locators if UI changes
4. Add test to appropriate category

### Updating Locators
When the website UI changes:
1. Update locators in page classes
2. Use robust selectors (prefer role-based)
3. Test with multiple browsers
4. Update test documentation

### Best Practices
- Use descriptive test names
- Group related tests
- Use test steps for clarity
- Handle async operations properly
- Add appropriate assertions
- Use retry logic for flaky operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review test reports for debugging

## 🔄 Version History

- **v1.0.0**: Initial release with 50 test cases
- Page Object Model implementation
- Multi-browser support
- Mobile testing capabilities
- Comprehensive error handling 