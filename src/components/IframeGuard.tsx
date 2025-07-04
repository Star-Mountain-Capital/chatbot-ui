import { ReactNode, useEffect, useState } from "react";
import { isAllowedDomain, isDevelopmentMode } from "@/config/security";

interface IframeGuardProps {
  children: ReactNode;
  allowedDomain: string;
}

export function IframeGuard({ children, allowedDomain }: IframeGuardProps) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIframeAccess = () => {
      // Bypass iframe check in development mode
      if (isDevelopmentMode()) {
        console.log("Development mode: Bypassing iframe access check");
        setIsAllowed(true);
        setIsLoading(false);
        return;
      }

      try {
        // Check if we're in an iframe
        const isInIframe = window !== window.parent;
        
        if (!isInIframe) {
          console.warn("Access denied: App must be accessed from an iframe");
          setIsAllowed(false);
          setIsLoading(false);
          return;
        }

        // Try to get the parent window's origin
        const parentOrigin = window.parent.location.origin;
        
        // Check if the parent origin matches the allowed domain pattern
        if (isAllowedDomain(parentOrigin)) {
          console.log("Access granted: Valid iframe origin detected");
          setIsAllowed(true);
        } else {
          console.warn(`Access denied: Invalid iframe origin. Expected: ${allowedDomain}, Got: ${parentOrigin}`);
          setIsAllowed(false);
        }
      } catch {
        // If we can't access parent window due to same-origin policy,
        // but we are in an iframe, assume access is allowed (Retool embeds as iframe)
        console.warn("Access allowed: Cannot verify iframe origin due to same-origin policy, but running in iframe.");
        setIsAllowed(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure the DOM is fully loaded
    const timer = setTimeout(checkIframeAccess, 100);
    
    return () => clearTimeout(timer);
  }, [allowedDomain]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Access Restricted
          </h1>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 