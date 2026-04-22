from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ride, Location, Passenger


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class PassengerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Passenger
        fields = ['id', 'user', 'joined_at']


class RideSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    point_a = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    point_b = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    passenger_count = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = '__all__'

    def get_passenger_count(self, obj):
        return obj.passangers.count()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['point_a'] = LocationSerializer(instance.point_a).data
        representation['point_b'] = LocationSerializer(instance.point_b).data
        return representation


class RideStatsSerializer(serializers.Serializer):
    total_rides = serializers.IntegerField()
    active_users = serializers.IntegerField()


class RideHistorySerializer(serializers.Serializer):
    query = serializers.CharField(max_length=100)
    timestamp = serializers.DateTimeField()