from django.db import models
import pygeohash as pgh

# Create your models here.

class Location(models.Model):
    """Model for storing locations with geohash"""
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    lon = models.FloatField()
    geohash = models.CharField(max_length=12, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'locations'
        indexes = [
            models.Index(fields=['geohash']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        # Auto-generate geohash on save
        if self.lat and self.lon:
            self.geohash = pgh.encode(self.lat, self.lon, precision=9)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.geohash})"


class Report(models.Model):
    """Model for user-submitted location reports"""
    user_id = models.UUIDField()  # References Supabase profiles table
    lat = models.FloatField()
    lon = models.FloatField()
    description = models.TextField()
    image_url = models.TextField(null=True, blank=True)  # Optional image from Supabase Storage
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user_id', '-created_at']),
        ]

    def __str__(self):
        return f"Report by {self.user_id} at ({self.lat}, {self.lon}) - {self.created_at}"
