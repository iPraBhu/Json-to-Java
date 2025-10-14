# Security Policy

## Supported Versions
The `main` branch receives security updates. Please deploy the latest version to benefit from fixes.

## Reporting a Vulnerability
Report suspected vulnerabilities privately by emailing `security@example.com`. We aim to acknowledge reports within 48 hours and provide updates as fixes progress.

## Hardening Notes
- The application initializes a Trusted Types policy to help guard against DOM injection.
- All processing occurs client-side; there is no backend component.
- Download URLs are revoked after use to prevent dangling object URLs.
- Inputs are size-limited and parsed in Web Workers to isolate heavy computation.

Please avoid creating public GitHub issues for security-related reports.
