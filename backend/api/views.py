from rest_framework import status, permissions
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Ride, Location, Passenger
from .serializers import RideSerializer, LocationSerializer

# ___FBV___

@api_view(['GET'])
def get_location(request):
    locations = Location.objects.all()
    serializer = LocationSerializer(locations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_rides(request):
    rides = Ride.active.active_rides()
    serializer = RideSerializer(rides, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_rides(request):
    created = Ride.objects.filter(creator=request.user).order_by('-id')
    joined_ids = Passenger.objects.filter(user=request.user).values_list('ride_id', flat=True)
    joined = Ride.objects.filter(id__in=joined_ids).exclude(creator=request.user).order_by('-id')

    return Response({
        'created': RideSerializer(created, many=True).data,
        'joined': RideSerializer(joined, many=True).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_ride(request, pk):
    """Присоединиться к поездке"""
    try:
        ride = Ride.objects.get(pk=pk)
    except Ride.DoesNotExist:
        return Response({'error': 'Поездка не найдена'}, status=status.HTTP_404_NOT_FOUND)

    if ride.creator == request.user:
        return Response({'error': 'Вы не можете присоединиться к своей поездке'}, status=status.HTTP_400_BAD_REQUEST)

    if ride.status == 'full':
        return Response({'error': 'Поездка уже заполнена'}, status=status.HTTP_400_BAD_REQUEST)

    _, created = Passenger.objects.get_or_create(ride=ride, user=request.user)

    if not created:
        return Response({'error': 'Вы уже в этой поездке'}, status=status.HTTP_400_BAD_REQUEST)

    count = Passenger.objects.filter(ride=ride).count()
    if count >= ride.max_seats:
        ride.status = 'full'
        ride.save()

    return Response({'message': 'Вы успешно присоединились к поездке!'}, status=status.HTTP_200_OK)


# ___CBV___

class RideListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        rides = Ride.objects.all().order_by('-id')
        serializer = RideSerializer(rides, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()

        for field in ['point_a', 'point_b']:
            val = data.get(field, '')
            if val and not str(val).isdigit():
                loc, _ = Location.objects.get_or_create(name=str(val).strip())
                data[field] = loc.id

        serializer = RideSerializer(data=data)
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RideDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Ride.objects.get(pk=pk)
        except Ride.DoesNotExist:
            return None

    def get(self, request, pk):
        ride = self.get_object(pk)
        if not ride:
            return Response(status=status.HTTP_404_NOT_FOUND)

        data = RideSerializer(ride).data

        passengers = Passenger.objects.filter(ride=ride).select_related('user')
        data['passengers'] = [
            {'id': p.user.id, 'username': p.user.username, 'joined_at': p.joined_at}
            for p in passengers
        ]
        data['is_creator'] = ride.creator == request.user
        data['is_joined'] = Passenger.objects.filter(ride=ride, user=request.user).exists()
        return Response(data)

    def put(self, request, pk):
        ride = self.get_object(pk)
        if not ride:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if ride.creator != request.user:
            return Response({'error': 'Только создатель может изменить поездку'}, status=status.HTTP_403_FORBIDDEN)
        serializer = RideSerializer(ride, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        ride = self.get_object(pk)
        if not ride:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if ride.creator != request.user:
            return Response({'error': 'Только создатель может удалить поездку'}, status=status.HTTP_403_FORBIDDEN)
        ride.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if not username or not password or not email:
            return Response({'error': 'Заполните все поля (ник, почта, пароль)'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Этот никнейм уже занят'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Эта почта уже используется'}, status=status.HTTP_400_BAD_REQUEST)

        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return Response({'error': 'Некорректный формат почты'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'username': user.username
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"ОШИБКА РЕГИСТРАЦИИ: {str(e)}")
        return Response({'error': 'Ошибка на стороне сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    request.auth.delete()
    return Response({"message": "Выход из системы завершён"}, status=status.HTTP_200_OK)