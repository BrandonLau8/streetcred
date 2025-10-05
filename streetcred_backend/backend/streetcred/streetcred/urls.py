"""
URL configuration for streetcred project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from myapp import views
from myapp.api import api
from myapp.badge_api import api as badge_api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),  # Django Ninja API endpoints
    path('api/badges/', badge_api.urls),  # Badge rewards API
    path('map/', views.map_view, name='map_view'),
    path('map/add-location/', views.add_location, name='add_location'),
    path('api/identify-neighborhood/', views.identify_neighborhood, name='identify_neighborhood'),
]
