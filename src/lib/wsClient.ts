import { Status } from "@/store/types";

export interface WSClientOptions {
  serverUrl: string;
  onProgress?: (data: unknown) => void;
  onStatusChange?: (status: Status) => void;
}

/*
 * Lightweight wrapper around native WebSocket to mimic the minimal API surface
 * we used previously with `McpClient`.  Only the subset of features required by
 * `useMCP` is implemented (connect / disconnect / callTool).
 */
export class WsClient {
  private socket: WebSocket | null = null;
  private options: WSClientOptions;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(options: WSClientOptions) {
    this.options = options;
  }

  private startPing(): void {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.options.serverUrl);

        this.socket.addEventListener("open", () => {
          this.options.onStatusChange?.("connected");
          this.startPing();
          resolve();
        });

        this.socket.addEventListener("error", (evt) => {
          console.error("WebSocket error", evt);
          this.stopPing();
          this.options.onStatusChange?.("error");
          reject(evt);
        });

        this.socket.addEventListener("close", () => {
          this.stopPing();
          this.options.onStatusChange?.("disconnected");
        });

        this.socket.addEventListener("message", (evt) => {
          try {
            const payload = JSON.parse(evt.data);
            this.options.onProgress?.(payload);
          } catch (err) {
            console.warn("Failed to parse WS message", err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async disconnect(): Promise<void> {
    this.stopPing();
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  // Low-level send helper
  public send(data: unknown): void {
    this.socket?.send(JSON.stringify(data));
  }

} 