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

  constructor(options: WSClientOptions) {
    this.options = options;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.options.serverUrl);

        this.socket.addEventListener("open", () => {
          this.options.onStatusChange?.("connected");
          resolve();
        });

        this.socket.addEventListener("error", (evt) => {
          console.error("WebSocket error", evt);
          this.options.onStatusChange?.("error");
          reject(evt);
        });

        this.socket.addEventListener("close", () => {
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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  // Low-level send helper
  public send(data: unknown): void {
    this.socket?.send(JSON.stringify(data));
  }

} 