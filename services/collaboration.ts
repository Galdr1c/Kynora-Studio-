import { Collaborator, ChatMessage, LogoLayer } from "../types";

type CollabEvent = 
  | { type: 'JOIN', collaborator: Collaborator }
  | { type: 'LEAVE', id: string }
  | { type: 'CURSOR', id: string, x: number, y: number }
  | { type: 'LAYER_UPDATE', layerId: string, updates: Partial<LogoLayer>, userId: string }
  | { type: 'CHAT', message: ChatMessage };

class CollabService {
  private channel: BroadcastChannel;
  private listeners: ((event: CollabEvent) => void)[] = [];
  public currentUser: Collaborator;

  constructor() {
    this.channel = new BroadcastChannel('kitcha-collab-v1');
    this.currentUser = {
      id: crypto.randomUUID(),
      name: `Designer_${Math.floor(Math.random() * 1000)}`,
      color: ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)],
      x: 0,
      y: 0
    };

    this.channel.onmessage = (msg) => {
      this.listeners.forEach(l => l(msg.data));
    };
  }

  onEvent(cb: (event: CollabEvent) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  join() {
    this.channel.postMessage({ type: 'JOIN', collaborator: this.currentUser });
  }

  updateCursor(x: number, y: number) {
    this.currentUser.x = x;
    this.currentUser.y = y;
    this.channel.postMessage({ type: 'CURSOR', id: this.currentUser.id, x, y });
  }

  broadcastLayerUpdate(layerId: string, updates: Partial<LogoLayer>) {
    this.channel.postMessage({ type: 'LAYER_UPDATE', layerId, updates, userId: this.currentUser.id });
  }

  sendChatMessage(text: string) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderColor: this.currentUser.color,
      text,
      timestamp: Date.now()
    };
    this.channel.postMessage({ type: 'CHAT', message });
    return message;
  }
}

export const collabService = new CollabService();
