import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RideService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getRides(): Observable<any[]> {
    if (isPlatformBrowser(this.platformId) && !this.getToken()) {
      this.goToLogin();
      return of([]);
    }
    return this.http.get<any[]>(`${this.apiUrl}/rides/`);
  }

  getActiveRides(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rides/active/`);
  }

  getRideDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rides/${id}/`);
  }

  createRide(rideData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/rides/`, rideData);
  }

  deleteRide(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rides/${id}/`);
  }

  getMyRides(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rides/my/`);
  }

  joinRide(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rides/${id}/join/`, {});
  }

  getLocations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations/`);
  }
}