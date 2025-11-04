# StreetCred Deployment Refinements

This document provides guided instructions for fixing and improving your deployment setup.

## Current Status

✅ **Already Deployed**:
- Frontend: Vercel (`streetcred-eta.vercel.app`)
- Backend: Render (`streetcred-i8z3.onrender.com`)
- Database: Supabase PostgreSQL
- Storage: Supabase Storage (badge images)

## Critical Issues to Fix

### 🔴 Issue 1: SQLite Database Gets Wiped on Deploy

**Problem**: `streetcred_backend/backend/streetcred/streetcred/settings.py` line 87-91 uses SQLite
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # ❌ Ephemeral on Render!
    }
}
```

**Impact**: Every time you deploy, your Location model data disappears.

**Solution**: Connect Django to Supabase PostgreSQL

#### Step 1.1: Get Supabase Database Connection String

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection String** section
5. Select **URI** tab
6. Copy the connection string (should look like: `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)

#### Step 1.1a: Find Your Database Password

**Option A: If you saved it when creating the project**
- Use the password you set when first creating your Supabase project

**Option B: If you forgot your password (most common)**
1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Database Password** section
3. Click **Reset Database Password**
4. Enter a new password (save it somewhere safe!)
5. Click **Reset password**
6. Copy the new password

**Option C: Use the connection pooler string (easier)**
1. In Supabase Dashboard → **Settings** → **Database**
2. Under **Connection String**, select **URI** tab
3. Look for the **Connection Pooler** section (use port 6543, not 5432)
4. This is more reliable for external connections
5. Copy this full string and replace `[YOUR-PASSWORD]` with your database password

**Your final DATABASE_URL should look like**:
```
postgresql://postgres.[project-ref]:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

⚠️ **Important**:
- Remove the brackets `[]` around the password
- Use port `6543` (connection pooler) instead of `5432` for better stability
- Don't share this password - it's like your database's master key!

#### Step 1.2: Add PostgreSQL Dependencies

Add these to `streetcred_backend/backend/streetcred/pyproject.toml`:
```toml
dependencies = [
    # ... existing dependencies ...
    "dj-database-url>=2.1.0",      # Add this
    "psycopg2-binary>=2.9.9",      # Add this
    "whitenoise>=6.6.0",           # Add this (for static files)
]
```

Then run:
```bash
cd streetcred_backend/backend/streetcred
uv sync
```

#### Step 1.3: Update Django Settings

Edit `streetcred_backend/backend/streetcred/streetcred/settings.py`:

**Find and replace this section**:
```python
# OLD (lines 87-92)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**With this**:
```python
# NEW - Use PostgreSQL from environment variable or SQLite for local dev
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',  # Local development
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

#### Step 1.4: Add DATABASE_URL to Backend .env

Add to `streetcred_backend/backend/streetcred/.env`:
```env
# Add this line with your Supabase connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

#### Step 1.5: Run Migrations Locally to Test

```bash
cd streetcred_backend/backend/streetcred

# This should now connect to Supabase PostgreSQL
python manage.py migrate

# Create superuser if needed
python manage.py createsuperuser
```

#### Step 1.6: Add DATABASE_URL to Render

1. Go to Render Dashboard → Your Backend Service
2. Go to **Environment** tab
3. Add new environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. Click **Save Changes**

---

### 🟡 Issue 2: Security - Hardcoded SECRET_KEY and DEBUG=True

**Problem**: `settings.py` line 26-29
```python
SECRET_KEY = 'django-insecure--%89v3ycod-8+!4na+e_n^&f5h_*@m2y21s+jylzv7zt(-(kx&'  # ❌ Exposed!
DEBUG = True  # ❌ Should be False in production!
```

**Impact**: Security vulnerability, exposes error details to users.

**Solution**: Use environment variables

#### Step 2.1: Generate a New SECRET_KEY

Run this locally:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copy the output (will be a random 50-character string).

#### Step 2.2: Update settings.py

**Find and replace**:
```python
# OLD (lines 25-29)
SECRET_KEY = 'django-insecure--%89v3ycod-8+!4na+e_n^&f5h_*@m2y21s+jylzv7zt(-(kx&'
DEBUG = True
```

**With**:
```python
# NEW
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure--%89v3ycod-8+!4na+e_n^&f5h_*@m2y21s+jylzv7zt(-(kx&')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
```

#### Step 2.3: Add to Local .env

Add to `streetcred_backend/backend/streetcred/.env`:
```env
SECRET_KEY=<paste-the-50-char-string-from-step-2.1>
DEBUG=True
```

#### Step 2.4: Add to Render Environment Variables

1. Render Dashboard → Your Backend Service → **Environment**
2. Add:
   - **Key**: `SECRET_KEY`
   - **Value**: `<paste-the-50-char-string-from-step-2.1>`
3. Add:
   - **Key**: `DEBUG`
   - **Value**: `False`
4. Click **Save Changes**

---

### 🟡 Issue 3: CORS Too Permissive

**Problem**: `settings.py` line 148
```python
CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ Allows any website to call your API
```

**Impact**: Security risk - any website can make requests to your backend.

**Solution**: Remove this line

#### Step 3.1: Update settings.py

**Find and delete**:
```python
# DELETE this line (around line 148)
CORS_ALLOW_ALL_ORIGINS = True
```

Keep the specific origins (already correct):
```python
# KEEP this (already in settings.py)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://streetcred-eta.vercel.app",
]
```

---

### 🟢 Issue 4: Static Files Not Configured for Production

**Problem**: No static files handling for production deployment.

**Impact**: Admin panel CSS/JS won't load in production.

**Solution**: Add Whitenoise middleware

#### Step 4.1: Update Middleware in settings.py

**Find** (around line 53):
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... rest
]
```

**Change to**:
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

#### Step 4.2: Add Static Files Configuration

Add to bottom of `settings.py` (after line 149):
```python
# Static files configuration for production
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

---

## Render Deployment Configuration (uv Support)

### Option A: Use Render's Build Command with uv (Recommended)

Create `render.yaml` in project root (`/home/brandonlau/Documents/streetcred/render.yaml`):

```yaml
services:
  - type: web
    name: streetcred-backend
    runtime: python
    region: oregon
    plan: free
    buildCommand: |
      cd streetcred_backend/backend/streetcred
      pip install uv
      uv sync
      uv run python manage.py collectstatic --no-input
      uv run python manage.py migrate
    startCommand: cd streetcred_backend/backend/streetcred && uv run gunicorn streetcred.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        sync: false  # Set manually in dashboard
      - key: SECRET_KEY
        sync: false  # Set manually in dashboard
      - key: DEBUG
        value: False
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false  # Set manually in dashboard
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false  # Set manually in dashboard
      - key: GOOGLE_API_KEY
        sync: false  # Set manually in dashboard
```

### Option B: Use requirements.txt (Simpler but not using uv)

If Render doesn't support uv well, generate `requirements.txt`:

```bash
cd streetcred_backend/backend/streetcred
uv pip compile pyproject.toml -o requirements.txt
git add requirements.txt
```

Then Render will automatically detect and use it.

---

## Frontend Deployment (Vercel) - Already Working

Your frontend should already be deployed. Verify environment variables:

### Vercel Environment Variables Checklist

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Ensure you have:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
   - `VITE_API_BASE_URL` = `https://streetcred-i8z3.onrender.com` (your Render backend URL)

---

## Testing Your Deployment

### Step 1: Test Backend

```bash
# Test API docs
curl https://streetcred-i8z3.onrender.com/api/docs

# Test specific endpoint
curl https://streetcred-i8z3.onrender.com/api/locations
```

### Step 2: Test Frontend

1. Visit https://streetcred-eta.vercel.app
2. Check browser console for errors (F12 → Console tab)
3. Try logging in
4. Try viewing the map
5. Try accessing profile/badges

### Step 3: Test Database Persistence

1. Add a location via Django admin or API
2. Redeploy on Render (trigger a new deploy)
3. Check if location still exists after redeploy
4. ✅ If yes, database persistence is working!

---

## Deployment Checklist

Before deploying, ensure:

- [ ] PostgreSQL connection string added to `.env` locally
- [ ] `DATABASE_URL` environment variable added to Render
- [ ] `SECRET_KEY` generated and added to Render
- [ ] `DEBUG=False` set on Render
- [ ] `CORS_ALLOW_ALL_ORIGINS = True` removed from settings.py
- [ ] Whitenoise middleware added
- [ ] Static files configuration added
- [ ] Dependencies updated in `pyproject.toml` (if using uv) or `requirements.txt` generated
- [ ] All Supabase env vars set on Render
- [ ] All Vite env vars set on Vercel
- [ ] Migrations run: `uv run python manage.py migrate`
- [ ] Static files collected: `uv run python manage.py collectstatic`

---

## Common Deployment Issues

### Issue: "relation does not exist" error

**Cause**: Migrations not run on Supabase database

**Fix**:
```bash
cd streetcred_backend/backend/streetcred
# With DATABASE_URL set in .env
python manage.py migrate
```

### Issue: Backend shows "Bad Gateway" or 502

**Cause**: Server crashed, check Render logs

**Fix**:
1. Go to Render Dashboard → Your Service → **Logs**
2. Look for Python errors
3. Most common: missing environment variable

### Issue: CORS errors in browser console

**Cause**: Frontend URL not in CORS_ALLOWED_ORIGINS

**Fix**: Add your Vercel URL to `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://streetcred-eta.vercel.app",  # Make sure this is here
    "http://localhost:5173",
]
```

### Issue: Images not loading

**Cause**: Supabase Storage bucket not public or CORS not configured

**Fix**:
1. Go to Supabase → Storage → `badges` bucket
2. Make bucket public
3. Add CORS policy for your domains

---

## Free Tier Limitations to Know

### Render Free Tier:
- ⚠️ **Sleeps after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for one service 24/7)

**Workaround**: Use a free uptime monitor (UptimeRobot, Cron-job.org) to ping your backend every 10 minutes.

### Vercel Free Tier:
- ✅ No sleep, always fast
- 100 GB bandwidth/month
- Unlimited deployments

### Supabase Free Tier:
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- More than enough for this project

---

## Next Steps After Deployment

1. **Monitor your deployments**: Check Render/Vercel logs regularly
2. **Set up a custom domain** (optional, free with Vercel/Render)
3. **Add health check endpoint** for monitoring
4. **Set up error tracking** (Sentry free tier)
5. **Add automated backups** for Supabase database

---

## Questions?

If you encounter issues:
1. Check Render logs first
2. Check browser console for frontend errors
3. Test API endpoints at `/api/docs`
4. Verify all environment variables are set correctly
