#!/usr/bin/env python3
import os
import re
import sys
import json
import time
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    '.git', 'node_modules', '.vercel', '.next', 'dist', 'build', '_site', 'vendor', '.idea'
}

BINARY_EXTS = {
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.exe', '.dll', '.pdb', '.ico',
    '.mp4', '.mov', '.avi', '.xlsx', '.xls'
}

TEXT_EXTS = {
    '.md', '.html', '.js', '.css', '.json', '.yml', '.yaml', '.txt', '.csv', '.scss'
}

ZERO_WIDTH = ['\u200B', '\u200C', '\u200D', '\uFEFF']

SECRET_PATTERNS = [
    ('SUPABASE_ANON_KEY', re.compile(r'SUPABASE_ANON_KEY', re.IGNORECASE)),
    ('JWT_PREFIX', re.compile(r'eyJhbGciOi')), 
    ('APIKEY', re.compile(r'apiKey', re.IGNORECASE)),
    ('ANON_KEY', re.compile(r'anon key', re.IGNORECASE)),
]

REPORT_PATH = ROOT / 'tools' / 'SCAN_REPORT.md'


def walk_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = Path(dirpath).relative_to(ROOT)
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = Path(dirpath) / name
            rel = path.relative_to(ROOT)
            if rel.parts and rel.parts[0] in SKIP_DIRS:
                continue
            ext = path.suffix.lower()
            if ext in BINARY_EXTS:
                continue
            if ext in TEXT_EXTS:
                yield path


def read_bytes(path):
    with open(path, 'rb') as f:
        return f.read()


def decode_utf8(path, data):
    try:
        return data.decode('utf-8'), None
    except UnicodeDecodeError as e:
        return None, e


def find_suspicious(text):
    issues = []
    lines = text.splitlines()
    for i, line in enumerate(lines, start=1):
        if '\x00' in line:
            issues.append((i, 'NUL'))
        if '\uFFFD' in line:
            issues.append((i, 'REPLACEMENT_CHAR'))
        for zw in ZERO_WIDTH:
            if zw in line:
                issues.append((i, f'ZERO_WIDTH({zw})'))
        if '\u00A0' in line:
            issues.append((i, 'NBSP'))
    return issues


def has_crlf(data):
    return b'\r\n' in data


def parse_index_refs(index_path):
    refs = []
    try:
        data = index_path.read_text(encoding='utf-8')
    except Exception:
        return refs

    for match in re.finditer(r'(href|src)="([^"]+)"', data, re.IGNORECASE):
        path = match.group(2)
        if path.startswith('http://') or path.startswith('https://'):
            continue
        if path.startswith('//'):
            continue
        if path.startswith('#') or path.startswith('mailto:') or path.startswith('tel:'):
            continue
        refs.append(path)
    return refs


def path_exists_case_sensitive(rel_path):
    target = ROOT / rel_path
    if not target.exists():
        return False, None

    parts = Path(rel_path).parts
    current = ROOT
    actual_parts = []
    for part in parts:
        if not current.exists():
            return False, None
        try:
            entries = {p.name: p for p in current.iterdir()}
        except PermissionError:
            return True, None
        exact = entries.get(part)
        if exact:
            actual_parts.append(exact.name)
            current = exact
            continue
        lower = {p.name.lower(): p.name for p in entries.values()}
        if part.lower() in lower:
            actual_parts.append(lower[part.lower()])
            current = current / lower[part.lower()]
        else:
            return False, None

    actual_path = str(Path(*actual_parts))
    return True, actual_path


def git_ls_files(path):
    try:
        result = subprocess.run(
            ['git', 'ls-files', str(path)],
            cwd=str(ROOT),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        if result.returncode != 0:
            return None
        return result.stdout.strip()
    except Exception:
        return None


def scan_secrets(text, path):
    findings = []
    lines = text.splitlines()
    for i, line in enumerate(lines, start=1):
        for label, pattern in SECRET_PATTERNS:
            if pattern.search(line):
                findings.append((path, i, label))
    return findings


def main():
    files_scanned = 0
    utf8_failures = []
    suspicious = []
    crlf_files = []
    secret_findings = []

    for path in walk_files():
        files_scanned += 1
        data = read_bytes(path)
        text, err = decode_utf8(path, data)
        if err:
            utf8_failures.append((path, err.start))
            continue
        if has_crlf(data):
            crlf_files.append(path)
        suspicious.extend([(path, line, kind) for line, kind in find_suspicious(text)])
        secret_findings.extend(scan_secrets(text, path))

    required_missing = []
    index_path = ROOT / 'index.html'
    if not index_path.exists():
        required_missing.append('index.html')

    app_js_path = ROOT / 'JavaScript' / 'app.js'
    if not app_js_path.exists():
        required_missing.append('JavaScript/app.js')

    ref_paths = parse_index_refs(index_path) if index_path.exists() else []
    missing_refs = []
    case_mismatches = []
    for ref in ref_paths:
        ok, actual = path_exists_case_sensitive(ref)
        if not ok:
            missing_refs.append(ref)
        else:
            if actual:
                ref_norm = Path(ref).as_posix()
                actual_norm = Path(actual).as_posix()
                if actual_norm != ref_norm:
                    case_mismatches.append((ref, actual))

    tracked_config = None
    tracked_env = None
    config_path = ROOT / 'public' / 'config.js'
    env_path = ROOT / '.env.local'

    if config_path.exists():
        tracked_config = git_ls_files(config_path)
    if env_path.exists():
        tracked_env = git_ls_files(env_path)

    tracked_secrets = []
    secret_files_present = []
    if config_path.exists():
        secret_files_present.append('public/config.js exists')
        if tracked_config:
            tracked_secrets.append('public/config.js is tracked')
    if env_path.exists():
        secret_files_present.append('.env.local exists')
        if tracked_env:
            tracked_secrets.append('.env.local is tracked')

    # Report
    fail_conditions = []
    warn_conditions = []

    if utf8_failures:
        fail_conditions.append('UTF-8 decode failures')
    if required_missing:
        fail_conditions.append('Missing required files')
    if tracked_secrets:
        fail_conditions.append('Tracked secrets')

    if suspicious:
        warn_conditions.append('Suspicious characters')
    if missing_refs:
        warn_conditions.append('Missing referenced files')
    if case_mismatches:
        warn_conditions.append('Case mismatches')
    if crlf_files:
        warn_conditions.append('CRLF line endings')
    if secret_files_present:
        warn_conditions.append('Secret files present')
    if secret_findings:
        warn_conditions.append('Secret-like patterns')

    exit_code = 0
    if fail_conditions:
        exit_code = 1
    elif warn_conditions:
        exit_code = 2

    def status(ok):
        return 'PASS' if ok else 'FAIL'

    print('Repo Scan Report')
    print('==============')
    print(f'Files scanned: {files_scanned}')
    print('')
    print(f'Check: UTF-8 decode -> {status(not utf8_failures)}')
    if utf8_failures:
        for path, offset in utf8_failures:
            print(f'  {path.relative_to(ROOT)}: byte offset {offset}')

    print(f'Check: Required files -> {status(not required_missing)}')
    if required_missing:
        for item in required_missing:
            print(f'  Missing: {item}')

    print(f'Check: Referenced paths -> {status(not missing_refs)}')
    if missing_refs:
        for ref in missing_refs:
            print(f'  Missing ref: {ref}')

    print(f'Check: Case mismatches -> {status(not case_mismatches)}')
    if case_mismatches:
        for ref, actual in case_mismatches:
            print(f'  Case mismatch: {ref} -> actual {actual}')

    print(f'Check: Suspicious chars -> {status(not suspicious)}')
    if suspicious:
        for path, line, kind in suspicious:
            print(f'  {path.relative_to(ROOT)}:{line} {kind}')

    print(f'Check: CRLF line endings -> {status(not crlf_files)}')
    if crlf_files:
        for path in crlf_files:
            print(f'  {path.relative_to(ROOT)}')

    print(f'Check: Tracked secrets -> {status(not tracked_secrets)}')
    if tracked_secrets:
        for item in tracked_secrets:
            print(f'  {item}')

    print(f'Check: Secret files present -> {status(not secret_files_present)}')
    if secret_files_present:
        for item in secret_files_present:
            print(f'  {item}')

    print(f'Check: Secret-like patterns -> {status(not secret_findings)}')
    if secret_findings:
        for path, line, label in secret_findings:
            print(f'  {path.relative_to(ROOT)}:{line} pattern={label} [REDACTED]')

    # Write report
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    report_lines = []
    report_lines.append('# Repo Scan Report')
    report_lines.append('')
    report_lines.append(f'- Timestamp: {timestamp}')
    report_lines.append(f'- Files scanned: {files_scanned}')
    report_lines.append(f'- UTF-8 failures: {len(utf8_failures)}')
    report_lines.append(f'- Suspicious char warnings: {len(suspicious)}')
    report_lines.append(f'- Missing required files: {len(required_missing)}')
    report_lines.append(f'- Casing mismatches: {len(case_mismatches)}')
    report_lines.append(f'- Secret findings: {len(secret_findings)}')
    report_lines.append(f'- Secret files present: {len(secret_files_present)}')
    report_lines.append('')
    report_lines.append('## Recommended Fixes')
    if utf8_failures:
        report_lines.append('- Fix or re-encode files with UTF-8 decode failures.')
    if required_missing:
        report_lines.append('- Restore missing required files (index.html, JavaScript/app.js).')
    if missing_refs:
        report_lines.append('- Fix missing referenced paths in index.html or add files.')
    if case_mismatches:
        report_lines.append('- Fix path casing to match actual files for Linux hosting.')
    if tracked_secrets:
        report_lines.append('- Remove tracked secrets from git history and add to .gitignore.')
    if secret_files_present:
        report_lines.append('- Ensure secret files remain gitignored and are not committed.')
    if secret_findings:
        report_lines.append('- Review secret-like patterns and remove secrets from committed files.')
    if crlf_files:
        report_lines.append('- Normalize CRLF line endings to LF where required.')
    if not any([utf8_failures, required_missing, missing_refs, case_mismatches, tracked_secrets, secret_findings, crlf_files, suspicious]):
        report_lines.append('- No issues found.')

    REPORT_PATH.write_text('\n'.join(report_lines), encoding='utf-8')

    sys.exit(exit_code)


if __name__ == '__main__':
    main()
