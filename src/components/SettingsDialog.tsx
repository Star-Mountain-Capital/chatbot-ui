import { useState } from "react";
import { Status } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  connectionStatus: Status;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  serverUrl,
  onServerUrlChange,
  connectionStatus,
  onConnect,
  onDisconnect,
}: SettingsDialogProps) {
  const [localServerUrl, setLocalServerUrl] = useState(serverUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onServerUrlChange(localServerUrl);
    onConnect();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverUrl">Server URL</Label>
            <Input
              id="serverUrl"
              type="text"
              value={localServerUrl}
              onChange={(e) => setLocalServerUrl(e.target.value)}
              placeholder="https://your-mcp-server.com/sse"
            />
          </div>

          <div className="flex items-center">
            <span className="mr-2">Status:</span>
            <span
              className={cn("font-medium", {
                "text-green-600": connectionStatus === "connected",
                "text-red-600": connectionStatus === "error",
                "text-muted-foreground": connectionStatus === "disconnected",
              })}
            >
              {connectionStatus.charAt(0).toUpperCase() +
                connectionStatus.slice(1)}
            </span>
          </div>

          <DialogFooter className="sm:justify-end">
            {connectionStatus === "connected" ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
              >
                Disconnect
              </Button>
            ) : (
              <Button type="submit">Connect</Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
