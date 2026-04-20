from rest_framework import status, generics, permissions
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response  import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Ride, Location
from .serializers import RideSerializer, LocationSerializer

# ___FBV___

@api_view(['GET'])
def get_location(request):
    locations = Location.objects.all()
    serializer = LocationSerializer(locations, many = True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_rides(request):
    rides = Ride.active.active_rides()
    serializer = RideSerializer(rides, many = True)
    return Response(serializer.data)


# ___CBV___

class RideListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        rides = Ride.objects.all()
        serializer = RideSerializer(rides, many = True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = RideSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(creator = request.user)
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    

class RideDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try: return Ride.objects.get(pk = pk)
        except Ride.DoesNotExist: return None

    def get(self, request, pk):
        ride = self.get_object(pk)
        if not ride: return Response(status = status.HTTP_404_NOT_FOUND)
        serializer = RideSerializer(ride)
        return Response(serializer.data)

    def put(self, request, pk):
        ride = self.get_object(pk)
        serializer = RideSerializer(ride, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        ride = self.get_object(pk)
        ride.delete()
        return Response(status = status.HTTP_204_NO_CONTENT)

# Регистрация
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
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'username': user.username
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"ОШИБКА РЕГИСТРАЦИИ: {str(e)}")
        return Response({'error': 'Ошибка на стороне сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Авторизация
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    request.auth.delete()
    return Response({"message": "Выход из системы завершён"}, status=status.HTTP_200_OK)


