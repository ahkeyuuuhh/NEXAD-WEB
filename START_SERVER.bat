@echo off
echo.
echo ========================================
echo   NEXAD Website - Starting Server
echo ========================================
echo.
echo Server will start on: http://localhost:8080
echo Contact page: http://localhost:8080/contact.html
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python -m http.server 8080
