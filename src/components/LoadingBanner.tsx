import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingBannerProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingBanner = React.memo(function LoadingBanner({ isVisible, message = "Connecting to server..." }: LoadingBannerProps) {
  if (!isVisible) return null;
  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-200 text-yellow-900 text-center py-2 z-50 flex items-center justify-center">
      <Loader2 className="animate-spin mr-2" />
      {message}
    </div>
  );
}); 