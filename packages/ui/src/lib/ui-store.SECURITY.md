# UI Store Security Considerations

## Overview

The UI store uses cookies with `domain=.recurse.cc` to synchronize UI preferences (theme, sidebar states) across subdomains (www, docs, dashboard). This document outlines security considerations and mitigations.

## Security Measures Implemented

### 1. Cookie Attributes

- **`SameSite=Lax`**: Prevents CSRF attacks by only sending cookies on same-site requests
- **`Secure` flag (production)**: Cookies only sent over HTTPS, preventing man-in-the-middle interception
- **`path=/`**: Cookie available site-wide (required for cross-subdomain sync)
- **`domain=.recurse.cc`**: Shared across all subdomains (intentional for UX)

### 2. Data Validation

- **Type validation**: Theme values are validated against allowed values (`light`, `dark`, `system`)
- **Boolean coercion**: Sidebar states are coerced to booleans to prevent type confusion
- **URL encoding**: Cookie values are URL-encoded to prevent injection
- **Size limits**: Cookie size is checked (~4KB limit) to prevent DoS

### 3. Data Scope

**✅ Safe to store:**
- UI preferences (theme, sidebar states)
- Non-sensitive user preferences
- Client-side UI state

**❌ NEVER store:**
- Authentication tokens (use HttpOnly cookies or secure storage)
- Passwords or credentials
- Personally Identifiable Information (PII)
- API keys or secrets
- Session identifiers
- Payment information

## Security Risks & Mitigations

### Risk 1: Cross-Subdomain Cookie Access

**Issue**: Cookie with `domain=.recurse.cc` is accessible to ALL subdomains.

**Impact**: 
- If a malicious subdomain is added, it can read/modify the cookie
- XSS vulnerabilities in any subdomain can access the cookie

**Mitigation**:
- ✅ Only store non-sensitive UI preferences
- ✅ Monitor subdomain registrations
- ✅ Follow XSS prevention best practices (Content Security Policy, input sanitization)
- ✅ Use Content Security Policy headers to restrict script execution

### Risk 2: XSS Attacks

**Issue**: Since cookies are accessible via JavaScript (cannot use `HttpOnly`), XSS can read/modify them.

**Impact**: 
- Attacker could read theme preferences (low risk)
- Attacker could modify UI state (annoyance, not security breach)

**Mitigation**:
- ✅ Only store non-sensitive data
- ✅ Strict Content Security Policy
- ✅ Input validation and sanitization
- ✅ Regular security audits

### Risk 3: Cookie Theft via Man-in-the-Middle

**Issue**: Without `Secure` flag, cookies could be intercepted over HTTP.

**Mitigation**:
- ✅ `Secure` flag is set in production (HTTPS only)
- ✅ Development uses localhost (no external interception risk)
- ✅ Ensure all production domains use HTTPS with valid certificates

### Risk 4: Cookie Size Limits

**Issue**: Cookies have ~4KB size limit. Exceeding this can cause failures.

**Mitigation**:
- ✅ Size check before setting cookie
- ✅ UI state is intentionally minimal (<100 bytes)
- ✅ Fallback to localStorage if cookie too large

### Risk 5: Cookie Overflow/DOS

**Issue**: Too many cookies can cause performance issues or failures.

**Mitigation**:
- ✅ Single cookie stores all UI state (not multiple cookies)
- ✅ Minimal data footprint
- ✅ Cookie cleanup on errors

## Recommendations

### Short Term

1. ✅ **Implemented**: Add `Secure` flag in production
2. ✅ **Implemented**: Validate theme values
3. ✅ **Implemented**: Check cookie size limits
4. ✅ **Implemented**: URL-encode cookie values

### Medium Term

1. **Content Security Policy**: Implement strict CSP headers across all apps
2. **Subdomain Monitoring**: Set up alerts for new subdomain registrations
3. **Security Headers**: Add security headers (HSTS, X-Frame-Options, etc.)
4. **Input Validation**: Audit all user inputs for XSS vulnerabilities

### Long Term

1. **Consider Alternatives**: Evaluate if cross-subdomain sync is worth the risks
   - Alternative: Use postMessage API for cross-origin communication
   - Alternative: Accept that UI state is app-specific (simpler, no security concerns)
2. **Security Audit**: Regular penetration testing focused on cookie security
3. **Monitoring**: Log cookie access patterns for anomalies

## Browser Considerations

### Cookie Behavior Across Subdomains

- Cookies with `domain=.recurse.cc` are sent to:
  - `www.recurse.cc` ✅
  - `docs.recurse.cc` ✅
  - `dashboard.recurse.cc` ✅
  - `malicious.recurse.cc` ⚠️ (if registered)

### Same-Origin Policy

- JavaScript can only access cookies from the same origin
- With `domain=.recurse.cc`, all subdomains share the cookie
- This is intentional for UX but increases attack surface

## Compliance Considerations

### GDPR

- UI preferences are not personal data (no PII)
- No consent required for functional cookies
- No privacy implications

### Security Standards

- OWASP: Follows secure cookie practices
- NIST: Appropriate for non-sensitive data
- PCI-DSS: Not applicable (no payment data)

## References

- [OWASP Cookie Security](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [RFC 6265: HTTP State Management Mechanism](https://tools.ietf.org/html/rfc6265)

