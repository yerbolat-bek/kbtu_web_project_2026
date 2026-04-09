from django.db import models
from django.contrib.auth.models import User

class Location(models.Model):
    name = models.CharField(max_length=100, help_text="Например: КБТУ, Медеу")
    address = models.CharField(max_length=255, blank= True)

    def __str__(self):
        return self.name
    
class RideManager(models.Manager):
    def active_rides(self):
        return self.filter(status = 'open')
    
class Ride(models.Model):
    STATUS_CHOICES = [
        ('open', 'Открыто'),
        ('full', 'Заполнено'),
        ('done', 'Завыершено'),
    ]

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rides')
    point_a = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='rides_from')
    point_b = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='rides_to')

    departure_time = models.DateTimeField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_seats = models.IntegerField(default=3)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')

    objects = models.Manager()
    active = RideManager()

    def __str__(self):
        return f"{self.point_a} --> {self.point_b} ({self.departure_time.strftime('%H:%M')})"
    

class Passenger(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='passangers')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add = True)

    class Meta:
        unique_together = ('ride', 'user')


class RideComment(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.ride}"

