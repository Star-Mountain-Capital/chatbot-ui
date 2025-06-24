export const SECURITY_CONFIG = {
  // The only domain allowed to embed this app in an iframe
  ALLOWED_IFRAME_DOMAIN: "https://retool.starmountaincapital.com",
  
  // Additional security settings
  ENABLE_IFRAME_GUARD: true,
  ENABLE_CSP_HEADERS: true,
} as const;

// Helper function to check if a domain is allowed
export function isAllowedDomain(domain: string): boolean {
  const normalizedAllowed = SECURITY_CONFIG.ALLOWED_IFRAME_DOMAIN.replace(/\/$/, '');
  const normalizedDomain = domain.replace(/\/$/, '');
  return normalizedDomain === normalizedAllowed;
} 