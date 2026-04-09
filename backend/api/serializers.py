from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ride, Location

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class RideSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    point_a = LocationSerializer(read_only=True)
    point_b = LocationSerializer(read_only=True)

    class Meta:
        model = Ride
        fields = '__all__'

class RideStatsSerializer(serializers.Serializer):
    total_rides = serializers.IntegerField()
    active_users = serializers.IntegerField()

class RideHistorySerializer(serializers.Serializer):
    query = serializers.CharField(max_length=100)
    timestamp = serializers.DateTimeField()
