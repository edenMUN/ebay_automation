# Setup and Run Guide for ATID Store Playwright Tests

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npm run install-browsers
```

### 3. Verify Installation
```bash
npx playwright --version
```

## 🧪 Running Tests

### Method 1: Using npm scripts (Recommended)

#### Run All Tests
```bash
npm test
```

#### Run Tests by Category
```bash
# Sanity tests only (10 tests)
npm run test:sanity

# Logic tests only (20 tests)
npm run test:logic

# Error handling tests only (20 tests)
npm run test:error
```

#### Run with Browser UI
```bash
# Run all tests with visible browser
npm run test:headed

# Run specific category with visible browser
npx playwright test --headed --grep "@sanity"
```

#### Debug Mode
```bash
# Run all tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test --debug --grep "TS-001"
```

### Method 2: Using the Test Runner Script

```bash
# Run sanity tests
node run-tests.js sanity

# Run logic tests
node run-tests.js logic

# Run error handling tests
node run-tests.js error

# Run all tests
node run-tests.js all

# Run with browser UI
node run-tests.js headed

# Run in debug mode
node run-tests.js debug
```

### Method 3: Direct Playwright Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test src/tests/sanity-tests.spec.ts

# Run tests matching pattern
npx playwright test --grep "homepage"

# Run tests on specific browser
npx playwright test --project=chromium

# Run tests in parallel
npx playwright test --workers=4
```

## 📱 Mobile Testing

```bash
# Run tests on mobile Chrome
npx playwright test --project="Mobile Chrome"

# Run tests on mobile Safari
npx playwright test --project="Mobile Safari"
```

## 🔍 Debugging Tests

### 1. Debug Mode
```bash
npm run test:debug
```
This opens Playwright Inspector where you can:
- Step through test execution
- Inspect elements
- Modify locators
- See test actions in real-time

### 2. Code Generation
```bash
npm run codegen
```
This opens Playwright Codegen where you can:
- Record interactions
- Generate test code
- Explore the website

### 3. Trace Viewer
```bash
# After running tests, view traces
npx playwright show-trace test-results/trace.zip
```

## 📊 Test Reports

### View HTML Report
```bash
npm run test:report
```

### Reports Location
- HTML Report: `playwright-report/index.html`
- JSON Report: `test-results/results.json`
- JUnit Report: `test-results/results.xml`
- Screenshots: `test-results/` (on failure)
- Videos: `test-results/` (on failure)

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "Playwright browsers not found"
```bash
# Solution: Install browsers
npm run install-browsers
```

#### 2. "TypeScript compilation errors"
```bash
# Solution: Check TypeScript version
npx tsc --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. "Tests failing due to timeouts"
```bash
# Solution: Increase timeout in playwright.config.ts
use: {
  actionTimeout: 30000,
  navigationTimeout: 30000,
}
```

#### 4. "Element not found errors"
```bash
# Solution: Check if website is accessible
curl -I https://atid.store

# Update locators if website changed
# Use Playwright Inspector to find correct selectors
npm run test:debug
```

#### 5. "Network connectivity issues"
```bash
# Solution: Check internet connection
ping atid.store

# Use different network or VPN if needed
```

### Environment Variables

Create a `.env` file for custom configurations:
```env
BASE_URL=https://atid.store
HEADLESS=false
SLOW_MO=1000
TIMEOUT=30000
```

## 📋 Test Categories Overview

### Sanity Tests (@sanity) - 10 tests
- **Purpose**: Basic functionality verification
- **Execution time**: ~2-3 minutes
- **Coverage**: Homepage, navigation, basic interactions

### Logic Tests (@logic) - 20 tests  
- **Purpose**: Business workflows and complex interactions
- **Execution time**: ~5-7 minutes
- **Coverage**: Shopping cart, filtering, sorting, pagination

### Error Handling Tests (@error) - 20 tests
- **Purpose**: Edge cases and failure scenarios
- **Execution time**: ~4-6 minutes
- **Coverage**: Invalid inputs, network issues, security testing

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

### Local CI Simulation
```bash
# Run tests in CI mode (headless, no retries)
npx playwright test --reporter=json
```

## 📈 Performance Optimization

### Parallel Execution
```bash
# Run tests in parallel (adjust based on your machine)
npx playwright test --workers=4
```

### Sharding (for large test suites)
```bash
# Split tests across multiple machines
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

### Selective Testing
```bash
# Run only failed tests
npx playwright test --grep-invert="passed"

# Run tests matching specific pattern
npx playwright test --grep "cart"
```

## 🔧 Maintenance

### Update Dependencies
```bash
# Update Playwright
npm update @playwright/test

# Update browsers
npx playwright install
```

### Clean Test Results
```bash
# Remove test artifacts
rm -rf test-results playwright-report
```

### Validate Configuration
```bash
# Check Playwright configuration
npx playwright test --list
```

## 📞 Support

### Getting Help
1. Check this guide first
2. Review test reports for specific errors
3. Use debug mode to investigate issues
4. Check Playwright documentation: https://playwright.dev/

### Common Commands Reference
```bash
# Quick reference
npm test                    # Run all tests
npm run test:sanity        # Run sanity tests
npm run test:logic         # Run logic tests  
npm run test:error         # Run error tests
npm run test:headed        # Run with browser UI
npm run test:debug         # Run in debug mode
npm run test:report        # Show HTML report
npm run install-browsers   # Install browsers
npm run codegen           # Open code generator
``` 