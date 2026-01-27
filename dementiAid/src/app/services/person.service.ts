import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Person {
  _id?: string;
  name: string;
  relationship?: string;
  faceDescriptors?: number[][];
  image?: string; // Base64 or URL
  descriptor?: number[]; // Face descriptor
  createdAt?: Date;
  visitFrequency?: string;
  lastConversation?: string;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPeople(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/people`);
  }

  registerFace(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  deletePerson(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteperson/${id}`);
  }

  updatePerson(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/people/${id}`, data);
  }

}
