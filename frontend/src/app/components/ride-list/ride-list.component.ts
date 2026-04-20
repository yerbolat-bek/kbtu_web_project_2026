import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';


@Component({
  selector: 'app-ride-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ride-list.component.html',
  styleUrl: './ride-list.component.css'
})
export class RideListComponent {
[x: string]: any;
  rides: any[] = [];
router: any;

  constructor(private rideService: RideService){}

  ngOnInit() {
  this.rideService.getRides().subscribe({
    next: (data: any) => {
      this.rides = data;
    },
    error: (err: any) => {
      console.error('Бэкенд не пустил, но мы всё равно покажем дизайн:', err);
      // ВРЕМЕННО добавляем фейковые данные, чтобы ты увидел интерфейс как на фото
      this.rides = [
        { point_a_name: 'Мкр. Айнабулак', point_b_name: 'КБТУ', total_price: 3600, max_seats: 4, departure_time: new Date() },
        { point_a_name: 'Орбита', point_b_name: 'Достык Плаза', total_price: 2500, max_seats: 3, departure_time: new Date() }
      ];
    }
  });
  }
}
