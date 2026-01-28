import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Medicine {
  _id?: string;
  name: string;
  dose: string;
  schedule: string;
  time: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiUrl = `${environment.apiUrl}/medicines`;

  constructor(private http: HttpClient) { }

  getMedicines(): Observable<{ status: string, data: Medicine[] }> {
    return this.http.get<{ status: string, data: Medicine[] }>(this.apiUrl);
  }

  addMedicine(medicine: Medicine): Observable<{ status: string, data: Medicine }> {
    return this.http.post<{ status: string, data: Medicine }>(this.apiUrl, medicine);
  }

  updateMedicine(id: string, medicine: Medicine): Observable<{ status: string, data: Medicine }> {
    return this.http.put<{ status: string, data: Medicine }>(`${this.apiUrl}/${id}`, medicine);
  }

  deleteMedicine(id: string): Observable<{ status: string, message: string }> {
    return this.http.delete<{ status: string, message: string }>(`${this.apiUrl}/${id}`);
  }
}
