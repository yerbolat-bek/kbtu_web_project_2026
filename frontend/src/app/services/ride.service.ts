import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RideService {
  private apiUrl = 'http://127.0.0.1:8000/api/rides/'; 

  constructor(
    private http: HttpClient, public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getRides(): Observable<any[]> {
    let token = null;

    if (isPlatformBrowser(this.platformId)) {
        token = localStorage.getItem('token');
    }

    if (!token) {
        this.goToLogin();
        return new Observable<any[]>(subscriber => subscriber.next([]));
    }

    const headers = new HttpHeaders({
        'Authorization': `Token ${token.trim()}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
    }
}