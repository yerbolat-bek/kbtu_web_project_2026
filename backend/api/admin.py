from django.contrib import admin
from .models import Location, Ride, Passenger, RideComment

admin.site.register(Location)
admin.site.register(Ride)
admin.site.register(Passenger)
admin.site.register(RideComment)

