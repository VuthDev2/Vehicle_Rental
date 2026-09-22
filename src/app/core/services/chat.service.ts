import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

const API = environment.apiUrl;

export interface ChatMessage {
  _id?: string;
  userId: string;
  senderId: any; // Can be populated user object or ID
  text: string;
  isRead: boolean;
  createdAt?: string;
}

export interface Conversation {
  _id: string; // userId
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
    phone?: string;
    createdAt?: string;
  };
  lastMessage: ChatMessage;
  unreadCount: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private socket?: Socket;

  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private readonly incomingMessageSubject = new Subject<ChatMessage>();
  public incomingMessage$ = this.incomingMessageSubject.asObservable();

  constructor() {
    this.connectSocket();
  }

  private connectSocket() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // In production, connect to the same origin, in dev use environment URL
    const socketUrl = environment.production ? window.location.origin : environment.apiUrl.split('/api')[0];
    
    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('receive_message', (message: ChatMessage) => {
      this.incomingMessageSubject.next(message);
      const current = this.messagesSubject.value;
      // Ensure no duplicates
      if (!current.find(m => m._id === message._id)) {
        this.messagesSubject.next([...current, message]);
      }
    });
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join_chat', room);
    }
  }

  // Used by customers (fetches their own history)
  getHistory() {
    return this.http.get<{ messages: ChatMessage[] }>(`${API}/messages`);
  }

  // Used by admins to get all active conversations
  getConversations() {
    return this.http.get<{ conversations: Conversation[] }>(`${API}/messages`);
  }

  // Used by admins to get a specific customer's history
  getConversationHistory(userId: string) {
    return this.http.get<{ messages: ChatMessage[] }>(`${API}/messages?userId=${userId}`);
  }

  sendMessage(text: string, userId?: string) {
    return this.http.post<{ message: ChatMessage }>(`${API}/messages`, { text, userId });
  }

  // Emit a message instantly over sockets (after successful HTTP post)
  emitMessage(message: ChatMessage, receiverId: string) {
    if (this.socket) {
      this.socket.emit('send_message', { message, receiverId });
    }
  }

  setMessages(messages: ChatMessage[]) {
    this.messagesSubject.next(messages);
  }
}
