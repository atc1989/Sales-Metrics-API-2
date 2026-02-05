@echo off
python tools\repo_scan.py
set EXIT_CODE=%ERRORLEVEL%
echo Exit code: %EXIT_CODE%
exit /b %EXIT_CODE%
