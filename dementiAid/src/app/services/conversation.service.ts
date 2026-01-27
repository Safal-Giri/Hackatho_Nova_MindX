import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Conversation {
  _id?: string;
  personId: string;
  username: string;
  summary: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLastConversation(personId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/person/${personId}/latest`);
  }

  addConversation(data: Conversation): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations`, data);
  }

  getAllConversations(personId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/person/${personId}`);
  }
}
