from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from api.views import get_location, get_active_rides, RideListCreateView, RideDetailView, logout_user

urlpatterns = [
    path('login/', obtain_auth_token),
    path('logout/', logout_user),
    path('locations/', get_location),
    path('rides/active/', get_active_rides),
    path('rides/', RideListCreateView.as_view()),
    path('rides/<int:pk>/', RideDetailView.as_view()),
]