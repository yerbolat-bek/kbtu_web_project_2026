from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response  import Response
from rest_framework.views import APIView
from .models import Ride, Location
from .serializers import 