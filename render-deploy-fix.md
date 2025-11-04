# Render Deployment Fix

## Issue
Render was trying to run `./start.sh` which didn't exist, causing deployment to fail.

## What I Fixed

### 1. ✅ Created `start.sh`
Created `/streetcred_backend/backend/streetcred/start.sh` with:
- Database migrations
- Static file collection
- Gunicorn server start

### 2. ✅ Updated `render.yaml`
Added `rootDir` to tell Render where your Django project is:
```yaml
rootDir: streetcred_backend/backend/streetcred
```

## Next Steps - Update Render Dashboard Settings

You need to update your Render service configuration in the dashboard:

### Option A: Use render.yaml (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your `streetcred-backend` service**
3. **Go to Settings**
4. **Scroll to "Build & Deploy"**
5. **Change the following**:

   **Root Directory:**
   ```
   streetcred_backend/backend/streetcred
   ```

   **Build Command:**
   ```
   pip install uv && uv sync && uv run python manage.py collectstatic --no-input && uv run python manage.py migrate
   ```

   **Start Command:**
   ```
   uv run gunicorn streetcred.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
   ```

6. **Click "Save Changes"**
7. **Trigger Manual Deploy** or push to your branch

### Option B: Use Blueprint (Easier)

If your Render service was created manually, you can switch to using `render.yaml`:

1. **Delete the existing service** (don't worry, it's free)
2. **Create New → Blueprint**
3. **Connect your GitHub repo**
4. **Render will auto-detect `render.yaml`**
5. **Add environment variables** (see below)

## Required Environment Variables

Make sure these are set in Render Dashboard → Environment:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:PASSWORD@...` | Your Supabase connection string |
| `SECRET_KEY` | `<50-char-random-string>` | Generate with: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` | Must be False in production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Supabase dashboard |
| `GOOGLE_API_KEY` | `AIza...` | Your Google Gemini API key |
| `PYTHON_VERSION` | `3.11.0` | *(Should auto-detect from .python-version)* |

## Testing Your Fix

### Before Committing
Test the start script locally:

```bash
cd streetcred_backend/backend/streetcred

# Set environment variables
export PORT=8000
export DATABASE_URL="your-supabase-url"
export SECRET_KEY="your-secret-key"
export DEBUG=False

# Test the start script
./start.sh
```

If it works locally, commit and push:

```bash
git add render.yaml streetcred_backend/backend/streetcred/start.sh
git commit -m "Fix Render deployment configuration"
git push
```

### After Deploying

1. **Check Render Logs** (Dashboard → Your Service → Logs)
2. **Look for**:
   - ✅ "Build successful"
   - ✅ "Running migrations..."
   - ✅ "Starting Gunicorn on port..."
   - ✅ "Listening at: http://0.0.0.0:XXXX"

3. **Test Your API**:
   ```bash
   curl https://streetcred-i8z3.onrender.com/api/docs
   ```

## Common Errors & Fixes

### Error: "No such file or directory: start.sh"
**Fix**: Make sure you committed and pushed `start.sh`:
```bash
git add streetcred_backend/backend/streetcred/start.sh
git commit -m "Add start.sh"
git push
```

### Error: "connection to server failed"
**Fix**: Check `DATABASE_URL` environment variable in Render dashboard

### Error: "Application startup failed"
**Fix**: Check all environment variables are set correctly

### Error: "ModuleNotFoundError"
**Fix**: Check `uv sync` completed successfully in build logs

### Render keeps using old start command
**Fix**:
1. Render dashboard → Settings → Build & Deploy
2. Manually update "Start Command"
3. Clear build cache: Settings → scroll down → "Clear Build Cache & Deploy"

## Alternative: Simpler Deployment (No render.yaml)

If render.yaml is causing issues, you can set everything manually in Render dashboard:

**Service Settings:**
- **Build Command**:
  ```bash
  cd streetcred_backend/backend/streetcred && pip install uv && uv sync && uv run python manage.py collectstatic --no-input && uv run python manage.py migrate
  ```

- **Start Command**:
  ```bash
  cd streetcred_backend/backend/streetcred && uv run gunicorn streetcred.wsgi:application --bind 0.0.0.0:$PORT
  ```

## Verify Everything

Once deployed successfully:

✅ Backend API: https://streetcred-i8z3.onrender.com/api/docs
✅ Health check: https://streetcred-i8z3.onrender.com/admin/
✅ Frontend can reach backend (no CORS errors)
✅ Database queries work
✅ Supabase integration works

## Questions?

If deployment still fails:
1. Share the full Render logs (Dashboard → Logs → copy all)
2. Check which step fails (Build or Deploy?)
3. Verify all environment variables are set
