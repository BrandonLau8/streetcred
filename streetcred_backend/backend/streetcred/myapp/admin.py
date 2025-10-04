from django.contrib import admin
from .models import Location

# Register your models here.

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'lat', 'lon', 'geohash', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'geohash')
    readonly_fields = ('geohash', 'created_at', 'updated_at')
