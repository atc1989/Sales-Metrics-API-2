#!/usr/bin/env bash
python3 tools/repo_scan.py
EXIT_CODE=$?
echo "Exit code: $EXIT_CODE"
exit $EXIT_CODE
