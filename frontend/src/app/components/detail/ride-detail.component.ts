import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-ride-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ride-detail.component.html',
  styleUrl: './ride-detail.component.css'
})
export class RideDetailComponent implements OnInit {
  ride: any = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;
  isJoining: boolean = false;

  currentUsername: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rideService: RideService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUsername = localStorage.getItem('username') || '';
    }
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadRide(id);
    } else {
      this.errorMessage = 'Неверный ID поездки.';
      this.isLoading = false;
    }
  }

  loadRide(id: number) {
    this.isLoading = true;
    this.rideService.getRideDetail(id).subscribe({
      next: (data: any) => {
        this.ride = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Ошибка загрузки поездки:', err);
        this.errorMessage = err.status === 404
          ? 'Поездка не найдена.'
          : 'Не удалось загрузить поездку. Проверьте подключение.';
        this.isLoading = false;
      }
    });
  }

  joinRide() {
    this.isJoining = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.rideService.joinRide(this.ride.id).subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        this.isJoining = false;
        this.loadRide(this.ride.id);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Не удалось присоединиться.';
        this.isJoining = false;
      }
    });
  }

  deleteRide() {
    if (confirm('Удалить эту поездку?')) {
      this.rideService.deleteRide(this.ride.id).subscribe({
        next: () => { this.router.navigate(['/rides']); },
        error: (err: any) => {
          this.errorMessage = err.error?.error || 'Не удалось удалить поездку.';
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/rides']);
  }
}