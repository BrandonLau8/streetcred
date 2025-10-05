# Badge Reward System

Auto-awards badges to users when they reach point milestones (every 5 points).

## Setup

### 1. Run SQL Setup
Execute `badge_setup.sql` in Supabase SQL Editor to create:
- `user_badges` table
- `points` column in profiles
- RLS policies
- Indexes

### 2. Ensure Prerequisites
- Badges table populated with images
- Profiles table exists with user data

## How It Works

### Point Milestones
- **5 points** → 1st badge
- **10 points** → 2nd badge
- **15 points** → 3rd badge
- And so on...

### Badge Assignment
1. User earns points
2. System checks if milestone reached (multiple of 5)
3. Random badge selected from `badges` table
4. Badge saved to `user_badges` table
5. User can view all earned badges

## API Endpoints

Base URL: `/api/badges/`

### 1. Add Points & Auto-Award Badges
```http
POST /api/badges/add-points
Content-Type: application/json

{
  "user_id": "uuid-here",
  "points": 7
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "previous_points": 3,
  "new_points": 10,
  "points_added": 7,
  "new_badges": [
    {
      "milestone": 5,
      "badge": {
        "id": "badge-uuid",
        "animal": "rat",
        "location_name": "Times Square",
        "image_url": "https://..."
      },
      "awarded_at": "2025-10-05T12:00:00"
    },
    {
      "milestone": 10,
      "badge": {...}
    }
  ],
  "total_badges": 2,
  "next_milestone": 15
}
```

### 2. Get User's Badges
```http
GET /api/badges/user-badges/{user_id}
```

**Response:**
```json
{
  "user_id": "uuid",
  "total_badges": 3,
  "badges": [
    {
      "milestone": 5,
      "badge_id": "uuid",
      "earned_at": "2025-10-05T12:00:00",
      "badges": {
        "id": "uuid",
        "animal": "pigeon",
        "location_name": "Central Park",
        "image_url": "https://..."
      }
    }
  ]
}
```

### 3. Check Badge Progress
```http
GET /api/badges/badge-progress/{user_id}
```

**Response:**
```json
{
  "user_id": "uuid",
  "current_points": 13,
  "total_badges": 2,
  "milestones_reached": 2,
  "next_milestone": 15,
  "points_to_next_badge": 2,
  "progress_percent": 60.0
}
```

### 4. Backfill Missing Badges
```http
POST /api/badges/check-milestones
Content-Type: application/json

{
  "user_id": "uuid",
  "points": 25
}
```
Awards any missing badges for milestones user should have already reached.

## Python Usage

```python
from myapp.badge_rewards import update_user_points, get_user_badges

# Add points and auto-award badges
result = update_user_points(user_id="abc-123", points_to_add=8)
print(f"New badges: {len(result['new_badges'])}")

# Get all user badges
badges = get_user_badges(user_id="abc-123")
for badge in badges:
    print(f"Milestone {badge['milestone']}: {badge['badges']['animal']}")
```

## Frontend Integration Example

```javascript
// Add points after user action
async function awardPoints(userId, points) {
  const response = await fetch('/api/badges/add-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, points: points })
  });

  const result = await response.json();

  // Show new badges to user
  if (result.new_badges.length > 0) {
    showBadgeNotification(result.new_badges);
  }

  return result;
}

// Get user's badge collection
async function getUserBadges(userId) {
  const response = await fetch(`/api/badges/user-badges/${userId}`);
  return await response.json();
}

// Show progress to next badge
async function getBadgeProgress(userId) {
  const response = await fetch(`/api/badges/badge-progress/${userId}`);
  const progress = await response.json();

  console.log(`${progress.points_to_next_badge} points until next badge!`);
  return progress;
}
```

## Database Schema

### user_badges Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to profiles |
| badge_id | UUID | Reference to badges |
| milestone | INTEGER | Points milestone (5, 10, 15...) |
| earned_at | TIMESTAMP | When badge was earned |

**Constraints:**
- UNIQUE(user_id, milestone) - Prevents duplicate badges for same milestone

## Features

✅ Automatic badge awarding at milestones
✅ Random badge selection for variety
✅ Prevents duplicate badges for same milestone
✅ Backfill support for existing users
✅ Progress tracking
✅ Full badge history per user

## Testing

```bash
# Test with Python
python myapp/badge_rewards.py

# Test API with curl
curl -X POST http://localhost:8000/api/badges/add-points \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-uuid", "points": 12}'
```
