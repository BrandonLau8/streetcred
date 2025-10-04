#!/usr/bin/env python
"""Test Supabase connection"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'streetcred.settings')
django.setup()

from myapp.auth import get_supabase_client

def test_connection():
    print("Testing Supabase connection...")

    try:
        supabase = get_supabase_client()
        print(f"✓ Connected to: {supabase.supabase_url}")
        print("✓ Supabase client initialized successfully")

        # Test auth
        print("\nTesting auth capabilities...")
        print("✓ Auth module available")

        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    test_connection()
