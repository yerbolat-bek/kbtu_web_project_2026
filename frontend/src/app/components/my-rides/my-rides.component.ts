import { Component, OnInit } from '@angular/core';
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

  constructor(private rideService: RideService, private router: Router) {}

  ngOnInit() {
    this.rideService.getMyRides().subscribe({
      next: (data: any) => {
        this.myRides = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Не удалось загрузить ваши поездки.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  goToAllRides() {
    this.router.navigate(['/rides']);
  }

  deleteRide(rideId: number) {
    if (confirm('Вы уверены что хотите удалить поездку?')) {
      this.rideService.deleteRide(rideId).subscribe({
        next: () => {
          // Удаляем из локального массива без перезагрузки страницы
          this.myRides = this.myRides.filter(r => r.id !== rideId);
        },
        error: (err: any) => {
          this.errorMessage = 'Не удалось удалить поездку.';
        }
      });
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}