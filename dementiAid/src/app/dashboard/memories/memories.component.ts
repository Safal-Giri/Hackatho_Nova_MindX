import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService, Conversation } from '../../services/conversation.service';

@Component({
  selector: 'app-memories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memories.component.html',
  styleUrl: './memories.component.css'
})
export class MemoriesComponent implements OnInit {
  conversations: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private conversationService: ConversationService) { }

  ngOnInit(): void {
    this.fetchMemories();
  }

  fetchMemories() {
    this.loading = true;
    this.conversationService.getUserConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching memories:', err);
        this.error = 'Failed to load memories. Please try again later.';
        this.loading = false;
      }
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Unknown Date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

