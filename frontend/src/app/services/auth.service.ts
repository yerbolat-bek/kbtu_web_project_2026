import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getRides: any;
  constructor(private http: HttpClient){ }

  login(data: any) : Observable<any> {
    return this.http.post('http://127.0.0.1:8000/api/login/', data);
  }

  register(data: any) : Observable<any> {
    return this.http.post('http://127.0.0.1:8000/api/register/', data);
  }



 
  
}
