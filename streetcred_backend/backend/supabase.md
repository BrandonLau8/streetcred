# Supabase Documentation

## Overview

Supabase is an open-source Backend-as-a-Service (BaaS) platform that provides:
- **Full PostgreSQL Database** with auto-generated APIs
- **Authentication** with multiple providers
- **Real-time subscriptions** for live data updates
- **Storage** for files and media
- **Edge Functions** for serverless compute
- **Row Level Security (RLS)** for fine-grained access control

## Getting Started

### Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Install JavaScript client
npm install @supabase/supabase-js
```

### Initialize Project

```bash
# Login to Supabase
supabase login

# Initialize local project
supabase init

# Start local development server
supabase start

# Link to remote project
supabase link --project-ref [YOUR_PROJECT_ID]
```

### Create Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://[YOUR_PROJECT_ID].supabase.co',
  'YOUR_ANON_KEY'
)
```

---

## Authentication

### Sign Up (Email & Password)

```javascript
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123'
})
```

### Sign In (Email & Password)

```javascript
const { user, error } = await supabase.auth.signIn({
  email: 'user@example.com',
  password: 'securePassword123'
})
```

### Sign In with OTP (One-Time Password)

```javascript
// Send OTP
const { error } = await supabase.auth.signIn({
  email: 'user@example.com'
})

// Verify OTP
const { user, error } = await supabase.auth.verifyOTP({
  email: 'user@example.com',
  token: '123456',
  type: 'signin'
})
```

### Phone Authentication

```javascript
// Sign up with phone
const { user, error } = await supabase.auth.signUpWithPhone({
  phone: '+1234567890',
  password: 'securePassword123'
})
```

### Sign Out

```javascript
await supabase.auth.signOut()
```

### Get Current User

```javascript
const { data: { user } } = await supabase.auth.getUser()
```

### Update User Data

```javascript
const { user, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com',
  data: {
    display_name: 'New Name'
  }
})
```

---

## Database Operations (CRUD)

### Select Data

```javascript
// Select all columns
const { data, error } = await supabase
  .from('users')
  .select('*')

// Select specific columns
const { data, error } = await supabase
  .from('users')
  .select('id, name, email')

// Select with filters
const { data, error } = await supabase
  .from('cities')
  .select('name, country_id')
  .eq('name', 'The Shire')

// Select with limit
const { data, error } = await supabase
  .from('users')
  .select('id, name')
  .limit(10)
```

### Insert Data

```javascript
const { data, error } = await supabase
  .from('users')
  .insert([
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' }
  ])
  .select()
```

### Update Data

```javascript
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Updated Name' })
  .eq('id', 1)
  .select()
```

### Upsert (Insert or Update)

```javascript
const { data, error } = await supabase
  .from('instruments')
  .upsert({ id: 1, name: 'piano' })
  .select()
```

### Delete Data

```javascript
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1)
```

### Filtering Examples

```javascript
// Equal to
.eq('column', 'value')

// Not equal to
.neq('column', 'value')

// Greater than
.gt('age', 18)

// Less than or equal to
.lte('age', 65)

// Pattern matching
.like('name', '%John%')

// Case-insensitive pattern matching
.ilike('email', '%@gmail.com')

// In array
.in('status', ['active', 'pending'])

// Range
.gte('created_at', '2024-01-01')
.lte('created_at', '2024-12-31')
```

---

## Remote Procedure Calls (RPC)

### Create PostgreSQL Function

```sql
create or replace function hello_world()
returns text
language plpgsql
as $$
begin
  return 'Hello world';
end;
$$;
```

### Call RPC Function

```javascript
const { data, error } = await supabase
  .rpc('hello_world')

console.log(data) // "Hello world"
```

### RPC with Parameters

```sql
create or replace function add_numbers(a int, b int)
returns int
language plpgsql
as $$
begin
  return a + b;
end;
$$;
```

```javascript
const { data, error } = await supabase
  .rpc('add_numbers', { a: 5, b: 3 })

console.log(data) // 8
```

---

## Real-time Subscriptions

### Subscribe to Database Changes

```javascript
// Subscribe to all changes on a table
const subscription = supabase
  .channel('todos')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Specific Events

```javascript
// Subscribe to INSERT events only
supabase
  .channel('public:todos')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('New todo added:', payload.new)
    }
  )
  .subscribe()

// Subscribe to UPDATE events only
supabase
  .channel('public:todos')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('Todo updated:', payload.new)
      console.log('Old value:', payload.old)
    }
  )
  .subscribe()

// Subscribe to DELETE events only
supabase
  .channel('public:todos')
  .on('postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('Todo deleted:', payload.old)
    }
  )
  .subscribe()
```

### Unsubscribe

```javascript
supabase.removeChannel(subscription)
```

---

## Storage

### Upload File

```javascript
const file = event.target.files[0]
const fileName = "avatar1.png"

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${fileName}`, file, {
    cacheControl: '3600',
    contentType: 'image/png',
    upsert: false
  })
```

### Download File

```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .download('folder/avatar1.png')
```

### Get Public URL

```javascript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('folder/avatar1.png')

console.log(data.publicUrl)
```

### Create Signed URL (Private Files)

```javascript
const { data, error } = await supabase.storage
  .from('private-files')
  .createSignedUrl('document.pdf', 60) // Expires in 60 seconds
```

### Delete File

```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .remove(['folder/avatar1.png'])
```

### Bucket Management

```javascript
// Create bucket
const { data, error } = await supabase.storage
  .createBucket('new-bucket', {
    public: false,
    fileSizeLimit: 1024 * 1024 * 10 // 10MB
  })

// Update bucket
const { data, error } = await supabase.storage
  .updateBucket('avatars', {
    public: false,
    fileSizeLimit: 1024,
    allowedMimeTypes: ['image/png']
  })

// Empty bucket
const { data, error } = await supabase.storage
  .emptyBucket('avatars')

// Delete bucket
const { data, error } = await supabase.storage
  .deleteBucket('avatars')
```

---

## Edge Functions

### Create Edge Function

```bash
supabase functions new hello-world
```

### Basic Edge Function

```typescript
// supabase/functions/hello-world/index.ts
Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Edge Function with Supabase Client

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')

  if (error) {
    return new Response('Database error', { status: 500 })
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Deploy Edge Function

```bash
# Deploy specific function
supabase functions deploy hello-world

# Deploy all functions
supabase functions deploy

# Deploy without JWT verification
supabase functions deploy hello-world --no-verify-jwt
```

### Invoke Edge Function

```javascript
// From client
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'JavaScript' },
})

// Using fetch
const response = await fetch(
  'https://[YOUR_PROJECT_ID].supabase.co/functions/v1/hello-world',
  {
    method: 'POST',
    headers: {
      Authorization: 'Bearer YOUR_ANON_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'Fetch' }),
  }
)
```

### Local Development

```bash
# Start Supabase services
supabase start

# Serve specific function
supabase functions serve hello-world

# Serve all functions
supabase functions serve

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer SUPABASE_PUBLISHABLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

---

## Use Case Scenarios

### 1. Blog Platform

```javascript
// Create post
const { data: post, error } = await supabase
  .from('posts')
  .insert({
    title: 'My First Post',
    content: 'Hello World!',
    author_id: user.id
  })
  .select()
  .single()

// Get all posts with author info
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(name, avatar_url)
  `)
  .order('created_at', { ascending: false })

// Real-time updates for new posts
supabase
  .channel('posts')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('New post:', payload.new)
    }
  )
  .subscribe()
```

### 2. Chat Application

```javascript
// Send message
const { data } = await supabase
  .from('messages')
  .insert({
    room_id: 'general',
    user_id: user.id,
    content: 'Hello everyone!'
  })

// Subscribe to new messages
supabase
  .channel('room:general')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.general`
    },
    (payload) => {
      console.log('New message:', payload.new)
    }
  )
  .subscribe()
```

### 3. E-commerce Product Catalog

```javascript
// Search products
const { data: products } = await supabase
  .from('products')
  .select('*')
  .ilike('name', '%laptop%')
  .gte('price', 500)
  .lte('price', 2000)
  .eq('in_stock', true)
  .order('price', { ascending: true })

// Add to cart (using RPC for complex logic)
const { data } = await supabase
  .rpc('add_to_cart', {
    product_id: 123,
    quantity: 2,
    user_id: user.id
  })
```

### 4. File Upload with Progress

```javascript
async function uploadWithProgress(file) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${user.id}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false,
      onUploadProgress: (progress) => {
        const percent = (progress.loaded / progress.total) * 100
        console.log(`Upload progress: ${percent}%`)
      }
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
```

### 5. User Profile Management

```javascript
// Create profile after signup
async function createProfile(user) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: user.email.split('@')[0],
      avatar_url: null,
      created_at: new Date()
    })

  return { data, error }
}

// Update profile with avatar
async function updateProfile(file) {
  // Upload avatar
  const { data: uploadData } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/avatar.png`, file, { upsert: true })

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(uploadData.path)

  // Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id)

  return { data, error }
}
```

### 6. Scheduled Tasks with Edge Functions

```sql
-- Schedule function to run every minute
select cron.schedule(
  'invoke-cleanup-function',
  '* * * * *',
  $$
  select net.http_post(
    url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
          || '/functions/v1/cleanup',
    headers:=jsonb_build_object(
      'Content-type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);
```

### 7. AI-Powered Search with Edge Functions

```typescript
// Edge function for semantic search
import OpenAI from 'npm:openai@4.57.3'
import { createClient } from 'npm:@supabase/supabase-js@2'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const { query } = await req.json()

  // Generate embedding
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  })

  // Search similar documents
  const { data: documents } = await supabase
    .rpc('match_documents', {
      query_embedding: embedding.data[0].embedding,
      match_threshold: 0.78,
      match_count: 5
    })

  return new Response(JSON.stringify(documents), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Django Integration

### Installation

```bash
pip install supabase
```

### Setup

**settings.py:**
```python
SUPABASE_URL = "https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_KEY = "YOUR_ANON_KEY"  # Use environment variables in production
```

### Create Client

**utils.py or services.py:**
```python
from supabase import create_client, Client
from django.conf import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
```

### Usage in Views

```python
from django.http import JsonResponse
from .utils import get_supabase_client

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
```

### Authentication

```python
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
```

### Integration Approaches

**Option 1: Supabase as Primary Backend**
- Use Supabase for database, auth, and storage
- Django serves as API layer and business logic
- Bypass Django ORM entirely

**Option 2: Hybrid Approach**
- Use Django ORM with PostgreSQL for core app data
- Add Supabase features (realtime, storage) as supplements
- Maintain Django's built-in authentication

**Option 3: Supabase for Specific Features**
- Keep Django ORM and auth
- Use Supabase only for realtime subscriptions or file storage
- Best for existing Django apps adding new capabilities

### Environment Variables

**.env:**
```
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_KEY=your_anon_key
```

**settings.py:**
```python
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
```

---

## Best Practices

### 1. Security
- Always use Row Level Security (RLS) policies
- Never expose service role keys in client code
- Use environment variables for sensitive data
- Validate user input in Edge Functions

### 2. Performance
- Select only necessary columns
- Use pagination with `.limit()` and `.range()`
- Index frequently queried columns
- Use connection pooling for high-traffic apps

### 3. Real-time
- Unsubscribe from channels when components unmount
- Use specific event types instead of wildcards
- Filter subscriptions to reduce payload size

### 4. Storage
- Set appropriate file size limits
- Use content type validation
- Implement proper access policies
- Clean up unused files regularly

### 5. Edge Functions
- Keep functions small and focused
- Use caching when possible
- Handle errors gracefully
- Monitor function performance

---

## Resources

- [Official Documentation](https://supabase.com/docs)
- [GitHub Repository](https://github.com/supabase/supabase)
- [Community Discord](https://discord.supabase.com)
- [Example Projects](https://github.com/supabase/supabase/tree/master/examples)


