from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response  import Response
from rest_framework.views import APIView
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

api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    request.user.auth_token.delete()
    return Response({"message": "Successfully logged out"}, status = status.HTTP_200_OK)
