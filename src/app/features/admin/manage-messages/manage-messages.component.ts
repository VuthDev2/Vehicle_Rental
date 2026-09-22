import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, Conversation } from '../../../core/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-layout h-[calc(100vh-100px)] flex bg-white rounded-xl border border-edge-deep overflow-hidden">
      <!-- Sidebar / Conversation List -->
      <div class="w-80 border-r border-edge-deep flex flex-col bg-surface-deep">
        <div class="p-4 border-b border-edge-deep flex items-center justify-between">
          <h2 class="font-bold text-lg m-0 text-on-surface">Inbox</h2>
          <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
            {{ totalUnread() }} unread
          </span>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          @if (loadingConversations()) {
            <div class="p-4 flex justify-center">
              <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            </div>
          } @else if (conversations().length === 0) {
            <div class="p-8 text-center text-on-surface-variant text-sm">
              No conversations yet.
            </div>
          } @else {
            @for (conv of conversations(); track conv._id) {
              <div 
                class="conversation-item p-4 border-b border-edge-deep/50 cursor-pointer transition-colors hover:bg-white flex gap-3 relative"
                [class.bg-white]="selectedConversation()?._id === conv._id"
                (click)="selectConversation(conv)"
              >
                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {{ conv.user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                    <h4 class="font-bold text-sm m-0 text-on-surface truncate">{{ conv.user.name }}</h4>
                    <span class="text-[10px] text-on-surface-variant flex-shrink-0">{{ conv.lastMessage.createdAt | date:'shortTime' }}</span>
                  </div>
                  <p class="text-xs text-on-surface-variant m-0 truncate" [class.font-bold]="conv.unreadCount > 0">
                    {{ conv.lastMessage.text }}
                  </p>
                </div>
                @if (conv.unreadCount > 0) {
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {{ conv.unreadCount }}
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col bg-white relative">
        @if (!selectedConversation()) {
          <div class="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined text-6xl mb-4 opacity-20">forum</span>
            <p>Select a conversation to start messaging</p>
          </div>
        } @else {
          <!-- Chat Header -->
          <div class="p-4 border-b border-edge-deep flex items-center gap-3 bg-white z-10">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {{ selectedConversation()?.user?.name?.charAt(0) | uppercase }}
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-base m-0 text-on-surface">{{ selectedConversation()?.user?.name }}</h3>
              <p class="text-xs text-on-surface-variant m-0">{{ selectedConversation()?.user?.email }}</p>
            </div>
            <button 
              (click)="showUserProfile.set(true)"
              class="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[16px]">account_circle</span>
              View Profile
            </button>
          </div>

          <!-- Profile Modal Overlay -->
          @if (showUserProfile()) {
            <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
              <div class="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-edge-deep/50 animate-in fade-in zoom-in-95 duration-200">
                <div class="p-8 pb-6 flex flex-col items-center border-b border-edge-deep/50 bg-gradient-to-b from-slate-50 to-white">
                  <div class="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-black mb-4 shadow-sm border border-primary/20">
                    {{ selectedConversation()?.user?.name?.charAt(0) | uppercase }}
                  </div>
                  <h2 class="text-xl font-black text-on-surface m-0 text-center">{{ selectedConversation()?.user?.name }}</h2>
                  <p class="text-sm text-on-surface-variant mt-1 text-center font-medium">{{ selectedConversation()?.user?.email }}</p>
                  <div class="mt-5 flex gap-2">
                    <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-wider border border-primary/20">
                      {{ selectedConversation()?.user?.role || 'Customer' }}
                    </span>
                    <span class="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-green-200">
                      Active
                    </span>
                  </div>
                </div>
                <div class="p-6 flex flex-col gap-5">
                  <div class="flex items-center gap-3 text-on-surface-variant">
                    <span class="material-symbols-outlined text-[20px]">phone</span>
                    <span class="text-sm font-semibold text-on-surface">{{ selectedConversation()?.user?.phone || 'No phone provided' }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-on-surface-variant">
                    <span class="material-symbols-outlined text-[20px]">calendar_today</span>
                    <span class="text-sm font-semibold text-on-surface">Joined {{ (selectedConversation()?.user?.createdAt | date:'mediumDate') || 'Recently' }}</span>
                  </div>
                </div>
                <div class="p-4 bg-slate-50 flex justify-end border-t border-edge-deep/50">
                  <button (click)="showUserProfile.set(false)" class="px-6 py-2.5 bg-white border border-edge-deep rounded-xl text-sm font-bold text-on-surface hover:bg-slate-100 transition-colors shadow-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50" #messagesContainer>
            @if (loadingMessages()) {
              <div class="flex justify-center p-4">
                <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            } @else {
              @for (msg of messages(); track msg._id || msg.createdAt) {
                <div class="flex items-start max-w-[70%]" [class.ml-auto]="msg.senderId?.role === 'admin' || isAdminReply(msg)">
                  <div 
                    class="p-3 rounded-2xl relative"
                    [class]="(msg.senderId?.role === 'admin' || isAdminReply(msg)) ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-edge-deep text-on-surface rounded-bl-sm'"
                  >
                    <p class="m-0 text-sm whitespace-pre-wrap">{{ msg.text }}</p>
                    <span 
                      class="text-[9px] block mt-1 text-right"
                      [class]="(msg.senderId?.role === 'admin' || isAdminReply(msg)) ? 'text-white/70' : 'text-on-surface-variant'"
                    >
                      {{ (msg.createdAt | date:'shortTime') || 'Now' }}
                    </span>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Input Area -->
          <div class="p-4 border-t border-edge-deep bg-white flex gap-3">
            <input 
              type="text" 
              [(ngModel)]="newMessage"
              (keyup.enter)="sendMessage()"
              placeholder="Type your reply..."
              class="flex-1 px-4 py-3 bg-surface-deep border border-edge-deep rounded-xl text-sm outline-none focus:border-primary transition-colors"
              [disabled]="sending()"
            />
            <button 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim() || sending()"
              class="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-primary/90"
            >
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ManageMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly chatService = inject(ChatService);
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<ChatMessage[]>([]);
  readonly selectedConversation = signal<Conversation | null>(null);
  
  readonly loadingConversations = signal(false);
  readonly loadingMessages = signal(false);
  readonly sending = signal(false);
  readonly totalUnread = signal(0);
  readonly showUserProfile = signal(false);
  
  newMessage = '';
  private subs = new Subscription();

  ngOnInit() {
    this.chatService.joinRoom('admin');
    this.loadConversations();

    this.subs.add(
      this.chatService.messages$.subscribe(msgs => {
        this.messages.set(msgs);
      })
    );

    this.subs.add(
      this.chatService.incomingMessage$.subscribe(msg => {
        // If it's for the currently open conversation, append it
        if (this.selectedConversation() && msg.userId === this.selectedConversation()!._id) {
          this.scrollToBottom();
          // We don't increment unread if we are looking at it
        } else {
          // Otherwise reload conversations to update sidebar
          this.loadConversations();
        }
      })
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  isAdminReply(msg: any): boolean {
    // If senderId is just a string, we might not know role, but usually populated
    if (typeof msg.senderId === 'object' && msg.senderId.role === 'admin') return true;
    // Fallback: if senderId is NOT the conversation's userId
    if (this.selectedConversation()) {
      const sId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
      return sId !== this.selectedConversation()!._id;
    }
    return false;
  }

  loadConversations() {
    this.loadingConversations.set(true);
    this.chatService.getConversations().subscribe({
      next: (res) => {
        this.conversations.set(res.conversations);
        this.totalUnread.set(res.conversations.reduce((acc, c) => acc + c.unreadCount, 0));
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false)
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
    this.showUserProfile.set(false); // Close profile if open
    this.loadingMessages.set(true);
    
    // Optimistically clear unread count in sidebar
    this.conversations.update(list => list.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
    this.totalUnread.set(this.conversations().reduce((acc, c) => acc + c.unreadCount, 0));

    this.chatService.getConversationHistory(conv._id).subscribe({
      next: (res) => {
        this.chatService.setMessages(res.messages);
        this.loadingMessages.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.loadingMessages.set(false)
    });
  }

  sendMessage() {
    const conv = this.selectedConversation();
    if (!conv || !this.newMessage.trim() || this.sending()) return;
    
    const text = this.newMessage;
    this.newMessage = '';
    this.sending.set(true);

    this.chatService.sendMessage(text, conv._id).subscribe({
      next: (res) => {
        // Emit to the user's specific room
        this.chatService.emitMessage(res.message, conv._id);
        this.sending.set(false);
        this.scrollToBottom();
        
        // Update sidebar last message
        this.conversations.update(list => list.map(c => 
          c._id === conv._id ? { ...c, lastMessage: res.message } : c
        ));
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
