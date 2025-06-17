import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { APIMessage, Message, SendMessagePayload } from "../types";

interface Subscription {
  roomId: string;
  callback: (msg: Message) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Subscription[] = [];
  private onConnectCallbacks: (() => void)[] = [];
  private onErrorCallbacks: ((error: string) => void)[] = [];

  connect(userId: number, token?: string) {
    if (this.client?.connected) return;

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(
          import.meta.env.VITE_BASE_API || "https://java-app-6euq.onrender.com"
        ),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        "user-id": userId.toString(),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      debug: (str) => console.debug("[WS]", str),
    });

    this.client.onConnect = () => {
      console.log("WebSocket connected");
      // Re-subscribe to all rooms on reconnect
      this.subscriptions.forEach(({ roomId, callback }) => {
        this.subscribeToRoomInternal(roomId, callback);
      });
      this.onConnectCallbacks.forEach((cb) => cb());
    };

    this.client.onStompError = (frame) => {
      const errorMsg = frame.headers.message || "Unknown STOMP error";
      console.error("STOMP error:", errorMsg);
      this.onErrorCallbacks.forEach((cb) => cb(errorMsg));
    };

    this.client.onDisconnect = () => {
      console.log("WebSocket disconnected");
    };

    this.client.activate();
  }

  private subscribeToRoomInternal(
    roomId: string,
    callback: (msg: Message) => void
  ) {
    if (!this.client?.connected) return;

    const subscription = this.client.subscribe(
      `/topic/room.${roomId}`,
      (message: IMessage) => {
        try {
          const apiMsg: APIMessage = JSON.parse(message.body);
          // Map APIMessage to Message
          const msg: Message = {
            fromMe:
              apiMsg.sender.id ===
              Number(this.client?.connectHeaders["user-id"]),
            type: apiMsg.attachments.length > 0 ? "image" : "text",
            content:
              apiMsg.attachments.length > 0
                ? apiMsg.attachments[0].url
                : apiMsg.content,
            createdAt: apiMsg.createdAt,
            id: apiMsg.id, // Use API message ID for deduplication
          };
          callback(msg);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      }
    );

    return subscription.unsubscribe;
  }

  subscribeToRoom(roomId: string, callback: (msg: Message) => void) {
    // Store subscription even if not connected
    const existing = this.subscriptions.find((sub) => sub.roomId === roomId);
    if (existing) {
      existing.callback = callback; // Update callback if room already subscribed
    } else {
      this.subscriptions.push({ roomId, callback });
    }

    if (this.client?.connected) {
      return this.subscribeToRoomInternal(roomId, callback) || (() => {});
    }

    return () => {
      this.unsubscribeFromRoom(roomId);
    };
  }

  unsubscribeFromRoom(roomId: string) {
    this.subscriptions = this.subscriptions.filter(
      (sub) => sub.roomId !== roomId
    );
    // STOMP subscription cleanup handled internally by unsubscribe
  }

  // Subscribe to room updates (e.g., last message changes)
  subscribeToRoomUpdates(
    callback: (update: {
      roomId: string;
      lastMessage: string;
      time: string;
    }) => void
  ) {
    if (!this.client?.connected) {
      this.subscriptions.push({
        roomId: "rooms",
        callback: callback as (msg: any) => void, // Type cast for simplicity
      });
      return () => this.unsubscribeFromRoom("rooms");
    }

    const subscription = this.client.subscribe(
      "/topic/rooms",
      (message: IMessage) => {
        try {
          const update: { roomId: string; lastMessage: string; time: string } =
            JSON.parse(message.body);
          callback(update);
        } catch (error) {
          console.error("Failed to parse room update:", error);
        }
      }
    );

    this.subscriptions.push({
      roomId: "rooms",
      callback: callback as (msg: any) => void,
    });

    return () => {
      subscription.unsubscribe();
      this.unsubscribeFromRoom("rooms");
    };
  }

  onConnect(callback: () => void) {
    this.onConnectCallbacks.push(callback);
    return () => {
      this.onConnectCallbacks = this.onConnectCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallbacks.push(callback);
    return () => {
      this.onErrorCallbacks = this.onErrorCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
    this.subscriptions = [];
    this.onConnectCallbacks = [];
    this.onErrorCallbacks = [];
  }

  isConnected() {
    return !!this.client?.connected;
  }

  // Send message via WebSocket (if backend supports sending via STOMP)
  sendMessage(roomId: string, payload: SendMessagePayload) {
    if (!this.client?.connected) {
      console.warn("WebSocket not connected, cannot send message");
      return;
    }

    this.client.publish({
      destination: `/app/room.${roomId}/send`,
      body: JSON.stringify(payload),
    });
  }
}

export const webSocketService = new WebSocketService();
