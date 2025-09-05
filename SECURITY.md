# Security Implementation

This application implements iframe-based access control to restrict access to only authorized domains.

## Iframe Access Control

The app is configured to only be accessible when embedded as an iframe from the authorized Retool domain: `https://retool.starmountaincapital.com`

### How it works

1. **Client-side validation**: The `IframeGuard` component checks if the app is being accessed from an iframe and validates the parent window's origin.

2. **Server-side headers**: Security headers are set in the HTML to prevent unauthorized embedding:
   - `X-Frame-Options: ALLOW-FROM https://retool.starmountaincapital.com`
   - `Content-Security-Policy: frame-ancestors 'self' https://retool.starmountaincapital.com`

3. **Configuration**: The allowed domain is centralized in `src/config/security.ts` for easy management.

### Implementation Details

#### IframeGuard Component

- Checks if the app is running in an iframe
- Validates the parent window's origin against the allowed domain
- Shows a loading state while checking
- Displays an access denied message if validation fails
- Only renders the app content if access is granted

#### Security Headers

- `X-Frame-Options`: Legacy header for iframe control
- `Content-Security-Policy`: Modern header for iframe control with better browser support

#### Configuration

```typescript
export const SECURITY_CONFIG = {
  ALLOWED_IFRAME_DOMAIN: 'https://retool.starmountaincapital.com',
  ENABLE_IFRAME_GUARD: true,
  ENABLE_CSP_HEADERS: true
} as const;
```

### Usage in Retool

To embed this app in Retool:

1. Add an iframe component to your Retool app
2. Set the iframe source to your deployed app URL
3. Ensure the Retool app is hosted on `https://retool.starmountaincapital.com`

Example iframe configuration in Retool:

```html
<iframe
  src="https://your-app-domain.com"
  width="100%"
  height="600px"
  frameborder="0"
  allowfullscreen
>
</iframe>
```

### Security Considerations

- **Same-origin policy**: The iframe guard handles cases where the parent window cannot be accessed due to same-origin policy restrictions
- **Domain normalization**: URLs are normalized to handle trailing slashes consistently
- **Graceful degradation**: If validation fails, users see a clear error message
- **Console logging**: Security events are logged to the browser console for debugging

### Modifying Allowed Domains

To change the allowed domain:

1. Update `SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN` in `src/config/security.ts`
2. Update the security headers in `index.html`
3. Rebuild and redeploy the application

### Testing

To test the iframe guard:

1. **Valid access**: Embed the app in an iframe from the allowed domain
2. **Invalid access**: Try to access the app directly or from an unauthorized domain
3. **Console logs**: Check browser console for security-related messages

### Browser Support

- Modern browsers support both `X-Frame-Options` and `Content-Security-Policy` headers
- The iframe guard works in all modern browsers with JavaScript enabled
- Graceful fallback for older browsers that don't support CSP headers
