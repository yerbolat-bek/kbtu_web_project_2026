import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-ride-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ride-list.component.html',
  styleUrl: './ride-list.component.css'
})
export class RideListComponent implements OnInit {
  rides: any[] = [];
  locations: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  showCreateForm: boolean = false;
  isSubmitting: boolean = false;
  joiningRideId: number | null = null;
  seatOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  currentUsername: string = '';

  newRide = {
    point_a: '',
    point_b: '',
    departure_time: '',
    total_price: '',
    max_seats: 3
  };

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
    this.loadRides();
    this.rideService.getLocations().subscribe({
      next: (data: any) => { this.locations = data; },
      error: (err: any) => { console.error('Ошибка загрузки локаций:', err); }
    });
  }

  loadRides() {
    this.rideService.getRides().subscribe({
      next: (data: any) => { this.rides = data; },
      error: (err: any) => {
        this.errorMessage = 'Не удалось загрузить поездки. Проверьте подключение.';
        console.error('Ошибка загрузки поездок:', err);
      }
    });
  }

  joinRide(rideId: number) {
    this.joiningRideId = rideId;
    this.errorMessage = '';
    this.successMessage = '';

    this.rideService.joinRide(rideId).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Вы присоединились к поездке!';
        this.joiningRideId = null;
        this.loadRides();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Не удалось присоединиться к поездке.';
        this.joiningRideId = null;
      }
    });
  }

  viewDetail(rideId: number) {
    this.router.navigate(['/rides', rideId]);
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showCreateForm) {
      this.newRide = { point_a: '', point_b: '', departure_time: '', total_price: '', max_seats: 3 };
    }
  }

  createRide() {
    if (!this.newRide.point_a || !this.newRide.point_b || !this.newRide.departure_time || !this.newRide.total_price) {
      this.errorMessage = 'Заполните все поля формы.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.rideService.createRide(this.newRide).subscribe({
      next: (created: any) => {
        this.rides.unshift(created);
        this.successMessage = 'Поездка успешно создана!';
        this.isSubmitting = false;
        this.showCreateForm = false;
        this.newRide = { point_a: '', point_b: '', departure_time: '', total_price: '', max_seats: 3 };
      },
      error: (err: any) => {
        console.error('Ошибка создания:', err);
        this.errorMessage = err.error?.detail || JSON.stringify(err.error) || 'Не удалось создать поездку.';
        this.isSubmitting = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    this.router.navigate(['/login']);
  }
}