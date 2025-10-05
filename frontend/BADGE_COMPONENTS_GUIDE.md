# Badge Components - Frontend Integration Guide

## Components Created

### 1. **UserBadges** (`src/components/UserBadges.jsx`)
Displays all badges earned by a user in a responsive grid layout.

**Features:**
- Fetches badges from `/api/badges/user-badges/{user_id}`
- Shows badge images, animal names, locations, and earned dates
- Displays milestone points for each badge
- Handles loading, error, and empty states
- Beautiful gradient cards with hover effects

### 2. **BadgeProgress** (`src/components/BadgeProgress.jsx`)
Shows user's progress toward their next badge milestone.

**Features:**
- Fetches progress from `/api/badges/badge-progress/{user_id}`
- Displays current points and total badges
- Animated progress bar showing % completion
- Shows points needed until next badge
- Next milestone indicator

## Integration in MapPage

The components have been added to `MapPage.jsx` at lines 228-231:

```jsx
{/* Badge Progress */}
<BadgeProgress userId={userId} />

{/* User Badges */}
<UserBadges userId={userId} />
```

## 🔴 **IMPORTANT: Set User ID**

The components require a `userId` prop to fetch data. Currently, `userId` is set to `null` (line 46 in MapPage.jsx).

### Option 1: Hardcoded User ID (Testing)
For testing, you can set a hardcoded user ID:

```jsx
const [userId, setUserId] = useState("your-test-user-uuid-here");
```

### Option 2: Get from Authentication Context (Production)
Replace the useState with your actual auth system:

```jsx
// Example with a custom auth hook
const { userId } = useAuth();

// Or with Supabase
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;
```

### Option 3: Pass as Prop
If the parent component has the userId, pass it as a prop:

```jsx
// In MapPage component definition
const MapPage = ({ userId }) => {
  // ... rest of code
```

## API Configuration

Both components point to `http://localhost:8000` as the backend URL. If your backend runs on a different port or domain, update the fetch URLs:

**In `UserBadges.jsx` (line 18):**
```jsx
const response = await fetch(`YOUR_API_URL/api/badges/user-badges/${userId}`);
```

**In `BadgeProgress.jsx` (line 18):**
```jsx
const response = await fetch(`YOUR_API_URL/api/badges/badge-progress/${userId}`);
```

## Testing

### 1. Test the Components
```bash
# Make sure backend is running
cd streetcred_backend/backend/streetcred
python manage.py runserver

# In another terminal, start the frontend
cd frontend
npm run dev
```

### 2. Test with Sample User
Use the badge API to add points and test the components:

```bash
# Add points to trigger badge awards
curl -X POST http://localhost:8000/api/badges/add-points \
  -H "Content-Type: application/json" \
  -d '{"user_id": "your-user-id", "points": 12}'
```

### 3. Check Browser Console
The components log fetch results to the console for debugging.

## Styling

Both components have their own CSS files:
- `src/components/UserBadges.css` - Badge grid and card styles
- `src/components/BadgeProgress.css` - Progress bar and stats styles

Feel free to customize colors, spacing, and animations to match your app's design.

## Next Steps

1. ✅ Set the `userId` in MapPage (see above)
2. ✅ Ensure backend API is running
3. ✅ Test the components with a real user
4. Optional: Add refresh functionality
5. Optional: Add animations when new badges are earned
6. Optional: Make components responsive to window resizing

## Component Props

### UserBadges
```jsx
<UserBadges
  userId={string}  // Required: User's UUID
/>
```

### BadgeProgress
```jsx
<BadgeProgress
  userId={string}  // Required: User's UUID
/>
```

## Troubleshooting

**Components show "Please log in"**
- Set the `userId` state/prop to a valid user UUID

**"Failed to fetch badges" error**
- Check that backend is running on `http://localhost:8000`
- Verify the user_id exists in your database
- Check browser console for CORS errors

**No badges showing**
- User might not have earned any badges yet
- Use the `/api/badges/add-points` endpoint to add points
- Verify badges table is populated with badge data

**Badge images not loading**
- Check that `image_url` in badges table is valid
- Ensure image URLs are accessible
- Check browser console for 404 errors
