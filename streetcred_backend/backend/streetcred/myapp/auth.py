from supabase import create_client, Client
from django.conf import settings
from django.http import JsonResponse

def get_supabase_client() -> Client:
    """Create Supabase client with proper SSL handling"""
    try:
        # Create client with default settings
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        raise


def get_users(request):
    supabase = get_supabase_client()
    response = supabase.table('users').select('*').execute()
    return JsonResponse(response.data, safe=False)

def create_user(request):
    supabase = get_supabase_client()
    data = {
        'name': request.POST.get('name'),
        'email': request.POST.get('email')
    }
    response = supabase.table('users').insert(data).execute()
    return JsonResponse(response.data, safe=False)

def signup(request):
    supabase = get_supabase_client()
    response = supabase.auth.sign_up({
        "email": request.POST.get('email'),
        "password": request.POST.get('password')
    })
    return JsonResponse({"user": response.user})

def signin(request):
    supabase = get_supabase_client()
    response = supabase.auth.sign_in_with_password({
        "email": request.POST.get('email'),
        "password": request.POST.get('password')
    })
    return JsonResponse({"session": response.session})