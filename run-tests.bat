@echo off
setlocal enabledelayedexpansion

echo ATID Store Playwright Test Runner
echo ================================

if "%1"=="" (
    echo.
    echo Available test modules:
    echo   sanity  - Run sanity tests only
    echo   logic   - Run logic tests only
    echo   error   - Run error handling tests only
    echo   all     - Run all tests
    echo   headed  - Run all tests with browser UI
    echo   debug   - Run all tests in debug mode
    echo.
    echo Usage: run-tests.bat ^<module^>
    exit /b 1
)

set MODULE=%1

if "%MODULE%"=="sanity" (
    echo Running sanity tests...
    npm run test:sanity
) else if "%MODULE%"=="logic" (
    echo Running logic tests...
    npm run test:logic
) else if "%MODULE%"=="error" (
    echo Running error handling tests...
    npm run test:error
) else if "%MODULE%"=="all" (
    echo Running all tests...
    npm test
) else if "%MODULE%"=="headed" (
    echo Running all tests with browser UI...
    npm run test:headed
) else if "%MODULE%"=="debug" (
    echo Running all tests in debug mode...
    npm run test:debug
) else (
    echo Unknown module: %MODULE%
    echo Use: sanity, logic, error, all, headed, or debug
    exit /b 1
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo Test execution failed with error code: %ERRORLEVEL%
    echo Check the output above for details.
    exit /b %ERRORLEVEL%
)

echo.
echo Test execution completed successfully! 