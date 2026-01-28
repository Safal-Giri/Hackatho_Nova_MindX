import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  summarizeTranscript(transcript: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.apiUrl}/ai/summarize`, { transcript });
  }
}
