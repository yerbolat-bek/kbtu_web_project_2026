import { Component, OnInit } from '@angular/core';
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

  newRide = {
    point_a: '',
    point_b: '',
    departure_time: '',
    total_price: '',
    max_seats: 3
  };

  constructor(private rideService: RideService, private router: Router) {}

  ngOnInit() {
    this.rideService.getRides().subscribe({
      next: (data: any) => {
        this.rides = data;
      },
      error: (err: any) => {
        this.errorMessage = 'Не удалось загрузить поездки. Проверьте подключение.';
        console.error('Ошибка загрузки поездок:', err);
      }
    });

    this.rideService.getLocations().subscribe({
      next: (data: any) => {
        this.locations = data;
      },
      error: (err: any) => {
        console.error('Ошибка загрузки локаций:', err);
      }
    });
  }

  joinRide(rideId: number) {
    alert(`Функция присоединения к поездке #${rideId} — здесь будет API запрос`);
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
      // ✅ Подставляем объекты локаций, чтобы point_a?.name работало в шаблоне
      const enriched = {
        ...created,
        point_a: { id: created.point_a, name: this.newRide.point_a },
        point_b: { id: created.point_b, name: this.newRide.point_b },
      };
      this.rides.unshift(enriched);
      this.successMessage = 'Поездка успешно создана!';
      this.isSubmitting = false;
      this.showCreateForm = false;
      this.newRide = { point_a: '', point_b: '', departure_time: '', total_price: '', max_seats: 3 };
    },
    error: (err: any) => {
      console.error('Ошибка создания поездки:', err);
      this.errorMessage = err.error?.detail || 'Не удалось создать поездку. Проверьте данные.';
      this.isSubmitting = false;
    }
  });
 }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}