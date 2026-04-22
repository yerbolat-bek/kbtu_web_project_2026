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
  createdRides: any[] = [];
  joinedRides: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  currentUsername: string = '';
myRides: any;

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
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          this.createdRides = data.created || [];
          this.joinedRides = data.joined || [];
        } else if (Array.isArray(data)) {
          this.createdRides = data.filter((r: any) => r.creator?.username === this.currentUsername);
          this.joinedRides = [];
        } else {
          this.createdRides = [];
          this.joinedRides = [];
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Ошибка /rides/my/:', err);
        if (err.status === 404) {
          this.fallbackToAllRides();
        } else if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Не удалось загрузить ваши поездки.';
          this.isLoading = false;
        }
      }
    });
  }

  private fallbackToAllRides() {
    this.rideService.getRides().subscribe({
      next: (data: any[]) => {
        this.createdRides = data.filter((r: any) => r.creator?.username === this.currentUsername);
        this.joinedRides = [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить поездки.';
        this.isLoading = false;
      }
    });
  }

  viewDetail(rideId: number) { this.router.navigate(['/rides', rideId]); }
  goToAllRides() { this.router.navigate(['/rides']); }

  deleteRide(rideId: number) {
    if (confirm('Удалить поездку?')) {
      this.rideService.deleteRide(rideId).subscribe({
        next: () => { this.createdRides = this.createdRides.filter(r => r.id !== rideId); },
        error: (err: any) => { this.errorMessage = err.error?.error || 'Не удалось удалить поездку.'; }
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