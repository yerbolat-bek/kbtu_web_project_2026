import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-my-rides',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-rides.component.html',
  styleUrl: './my-rides.component.css'
})
export class MyRidesComponent implements OnInit {
  myRides: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  currentUsername: string = '';

  constructor(
    private rideService: RideService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUsername = localStorage.getItem('username') || '';
    }
  }

  ngOnInit() {
    this.loadMyRides();
  }

  loadMyRides() {
    this.isLoading = true;
    this.errorMessage = '';

    this.rideService.getMyRides().subscribe({
      next: (data: any) => {
        if (data && !Array.isArray(data) && data.created) {
          this.myRides = [...(data.created || []), ...(data.joined || [])];
        } else if (Array.isArray(data)) {
          this.myRides = data.filter(
            (r: any) => r.creator?.username === this.currentUsername
          );
        } else {
          this.myRides = [];
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Ошибка:', err);
        if (err.status === 404) {
          this.rideService.getRides().subscribe({
            next: (all: any[]) => {
              this.myRides = all.filter(
                (r: any) => r.creator?.username === this.currentUsername
              );
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = 'Не удалось загрузить поездки.';
              this.isLoading = false;
            }
          });
        } else if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Не удалось загрузить ваши поездки.';
          this.isLoading = false;
        }
      }
    });
  }

  goToAllRides() { this.router.navigate(['/rides']); }

  deleteRide(rideId: number) {
    if (confirm('Удалить поездку?')) {
      this.rideService.deleteRide(rideId).subscribe({
        next: () => { this.myRides = this.myRides.filter(r => r.id !== rideId); },
        error: () => { this.errorMessage = 'Не удалось удалить поездку.'; }
      });
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    this.router.navigate(['/login']);
  }
}