import { Loader2 } from "lucide-react";

interface LoadingBannerProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingBanner({ isVisible, message = "Connecting to server..." }: LoadingBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
} 