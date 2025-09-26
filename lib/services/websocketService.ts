export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(url: string): void {
    // Заглушка для WebSocket соединения
    console.log('WebSocket connection to:', url);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: string | Record<string, unknown>): void {
    // Заглушка для отправки сообщений
    console.log('WebSocket send:', message);
  }
}



