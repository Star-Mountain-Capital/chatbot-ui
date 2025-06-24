import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  CallToolResultSchema,
  ClientRequest,
  LoggingMessageNotificationSchema,
  ProgressNotificationSchema,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export type Status = "connected" | "disconnected" | "error";

export interface Options {
  serverUrl: string;
  proxyUrl?: string;
  authToken?: string;
  onProgress?: (notification: ServerNotification) => void;
  onStatusChange?: (status: Status) => void;
}

export class McpClient {
  private client: Client | null = null;
  private transport: SSEClientTransport | null = null;
  private connectionStatus: Status = "disconnected";
  private progessToken: number = 0;
  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  public async connect(): Promise<void> {
    try {
      this.client = new Client({
        name: "chrome-use",
        version: "1.0.0",
      });

      this.transport = new SSEClientTransport(new URL(this.options.serverUrl));
      // Connect to the server
      await this.client.connect(this.transport);
      this.connectionStatus = "connected";

      // Update connection status
      if (this.options.onStatusChange) {
        this.options.onStatusChange("connected");
      }

      // Set notification handler if provided
      if (this.options.onProgress) {
        this.client.setNotificationHandler(
          ProgressNotificationSchema,
          this.options.onProgress,
        );

        this.client.setNotificationHandler(
          LoggingMessageNotificationSchema,
          this.options.onProgress,
        );
      }
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      this.connectionStatus = "error";
      this.options.onStatusChange?.("error");
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.transport?.close();
      this.connectionStatus = "disconnected";
      this.options.onStatusChange?.("disconnected");
    } catch (error) {
      console.error("Error disconnecting from MCP server:", error);
      throw error;
    }
  }

  public async callTool(
    name: string,
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ) {
    const req = {
      method: "tools/call",
      params: {
        name,
        arguments: params,
        _meta: { progressToken: this.progessToken++ },
      },
    } as const;

    return await this.makeRequest(req, CallToolResultSchema, {
      signal,
    });
  }

  public async makeRequest<T extends z.ZodType>(
    request: ClientRequest,
    schema: T,
    options?: RequestOptions,
  ): Promise<z.output<T>> {
    if (!this.client) throw new Error("MCP client not connected");

    return await this.client.request(request, schema, {
      signal: options?.signal,
      timeout: 999999999999999,
    });
  }

  public getConnectionStatus(): Status {
    return this.connectionStatus;
  }
}
