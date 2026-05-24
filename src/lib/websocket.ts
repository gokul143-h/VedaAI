import { getRuntimeConfig } from './runtimeConfig';

type MessageHandler = (data: Record<string, unknown>) => void;

export class AssessmentWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private assignmentId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async connect(assignmentId: string): Promise<void> {
    this.assignmentId = assignmentId;
    this.cleanup();

    const config = await getRuntimeConfig();
    const wsUrl = config.wsUrl;
    if (!wsUrl) return;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.ws?.send(
        JSON.stringify({ type: 'subscribe', assignmentId })
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        if (data.assignmentId === assignmentId || data.type === 'subscribed') {
          this.handlers.forEach((h) => h(data));
        }
      } catch {
        /* ignore */
      }
    };

    this.ws.onclose = () => {
      if (this.assignmentId) {
        this.reconnectTimer = setTimeout(() => {
          if (this.assignmentId) void this.connect(this.assignmentId);
        }, 3000);
      }
    };
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.assignmentId = null;
    this.cleanup();
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

export const assessmentWs = new AssessmentWebSocket();
