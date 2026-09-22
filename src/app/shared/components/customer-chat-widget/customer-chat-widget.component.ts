import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (authService.user()) {
      <div class="chat-widget-container">
        <!-- Chat Bubble Button -->
        @if (!isOpen()) {
          <button class="chat-bubble-btn" (click)="toggleChat()">
            <span class="material-symbols-outlined text-2xl">chat</span>
            @if (unreadCount() > 0) {
              <span class="unread-badge">{{ unreadCount() }}</span>
            }
          </button>
        }

        <!-- Chat Window -->
        @if (isOpen()) {
          <div class="chat-window shadow-xl border border-edge-deep">
            <div class="chat-header bg-primary text-white">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span class="material-symbols-outlined text-sm">support_agent</span>
                </div>
                <div>
                  <h3 class="font-bold text-sm m-0">Customer Support</h3>
                  <p class="text-xs text-white/70 m-0">Typically replies in a few minutes</p>
                </div>
              </div>
              <button class="close-btn" (click)="toggleChat()">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div class="chat-messages" #messagesContainer>
              @if (loading()) {
                <div class="flex justify-center p-4">
                  <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                </div>
              } @else {
                @for (msg of messages(); track msg._id || msg.createdAt) {
                  <div class="message-wrapper" [class.is-mine]="msg.senderId?._id === currentUser()?._id || msg.senderId === currentUser()?._id">
                    @if (msg.senderId?._id !== currentUser()?._id && msg.senderId !== currentUser()?._id) {
                      <div class="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mt-1 mr-2">
                        <span class="material-symbols-outlined text-[10px]">support_agent</span>
                      </div>
                    }
                    <div class="message-bubble" [class.is-mine]="msg.senderId?._id === currentUser()?._id || msg.senderId === currentUser()?._id">
                      <p class="m-0 text-sm whitespace-pre-wrap">{{ msg.text }}</p>
                      <span class="message-time">{{ (msg.createdAt | date:'shortTime') || 'Now' }}</span>
                    </div>
                  </div>
                }
              }
            </div>

            <div class="chat-input-area border-t border-edge-deep">
              <input 
                type="text" 
                [(ngModel)]="newMessage" 
                (keyup.enter)="sendMessage()"
                placeholder="Type your message..." 
                class="chat-input"
                [disabled]="sending()"
              />
              <button class="send-btn text-primary" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending()">
                <span class="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .chat-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
    }
    .chat-bubble-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: var(--color-primary);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .chat-bubble-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .unread-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #EF4444;
      color: white;
      font-size: 10px;
      font-weight: bold;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }
    .chat-window {
      width: 340px;
      height: 480px;
      background: var(--color-bg-deep);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: scale(0.95) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .chat-header {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--color-surface-deep);
    }
    .message-wrapper {
      display: flex;
      align-items: flex-start;
      max-width: 85%;
    }
    .message-wrapper.is-mine {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .message-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      background: var(--color-edge-deep);
      color: var(--color-on-surface);
      border-bottom-left-radius: 4px;
      position: relative;
    }
    .message-bubble.is-mine {
      background: var(--color-primary);
      color: white;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 4px;
    }
    .system-message {
      background: transparent;
      margin: 8px auto;
      align-self: center;
    }
    .message-time {
      font-size: 9px;
      opacity: 0.7;
      display: block;
      margin-top: 4px;
      text-align: right;
    }
    .chat-input-area {
      display: flex;
      padding: 12px;
      background: var(--color-bg-deep);
      align-items: center;
      gap: 8px;
    }
    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--color-edge-deep);
      border-radius: 20px;
      outline: none;
      font-size: 13px;
      background: var(--color-surface-deep);
      color: var(--color-on-surface);
    }
    .chat-input:focus {
      border-color: var(--color-primary);
    }
    .send-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .send-btn:not(:disabled):hover {
      background: var(--color-primary);
      color: white !important;
    }
  `]
})
export class CustomerChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  public readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  readonly isOpen = signal(false);
  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly unreadCount = signal(0);
  
  newMessage = '';
  currentUser = this.authService.user;
  
  private subs = new Subscription();

  ngOnInit() {
    if (this.currentUser()) {
      this.chatService.joinRoom(this.currentUser()!._id);
      
      this.subs.add(
        this.chatService.messages$.subscribe(msgs => {
          this.messages.set(msgs);
        })
      );

      this.subs.add(
        this.chatService.incomingMessage$.subscribe(msg => {
          if (!this.isOpen() && msg.senderId?._id !== this.currentUser()!._id && msg.senderId !== this.currentUser()!._id) {
            this.unreadCount.update(c => c + 1);
          }
          this.scrollToBottom();
        })
      );
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  toggleChat() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.unreadCount.set(0);
      this.loadHistory();
    }
  }

  loadHistory() {
    this.loading.set(true);
    this.chatService.getHistory().subscribe({
      next: (res) => {
        this.chatService.setMessages(res.messages);
        this.loading.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.loading.set(false)
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.sending()) return;
    
    const text = this.newMessage;
    this.newMessage = '';
    this.sending.set(true);

    this.chatService.sendMessage(text).subscribe({
      next: (res) => {
        this.chatService.emitMessage(res.message, 'admin'); // send to admin room
        this.sending.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.sending.set(false);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
