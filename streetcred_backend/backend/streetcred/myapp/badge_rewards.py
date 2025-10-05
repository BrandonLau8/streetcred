import os
from dotenv import load_dotenv
import random
from myapp.locater import identify_location

load_dotenv()

# Lazy load Supabase client to avoid SSL errors on module import
_supabase = None

def _get_supabase():
    global _supabase
    if _supabase is None:
        from supabase import create_client
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        _supabase = create_client(supabase_url, supabase_key)
    return _supabase


def get_next_milestone(points: int) -> int:
    """Calculate the next badge milestone"""
    return ((points // 5) + 1) * 5


def get_earned_milestones(points: int) -> list[int]:
    """Get all milestones that should have been earned for given points"""
    if points < 5:
        return []
    return [i * 5 for i in range(1, (points // 5) + 1)]


def award_badges_for_points(user_id: str, new_points: int, latitude: float, longitude: float) -> dict:
    """
    Award badges to user based on points milestones

    Args:
        user_id: User's profile ID
        new_points: User's new point total
        latitude: User's current latitude
        longitude: User's current longitude

    Returns:
        dict: {
            "new_badges": [list of newly awarded badges],
            "total_badges": total badge count,
            "next_milestone": next points needed for badge
        }
    """

    # Get all milestones user should have based on points
    earned_milestones = get_earned_milestones(new_points)

    if not earned_milestones:
        return {
            "new_badges": [],
            "total_badges": 0,
            "next_milestone": 5
        }

    # Check which milestones already have badges awarded
    supabase = _get_supabase()
    existing_badges = supabase.table("user_badges")\
        .select("milestone")\
        .eq("user_id", user_id)\
        .execute()

    existing_milestones = [b["milestone"] for b in existing_badges.data]

    # Find milestones that need badges
    missing_milestones = [m for m in earned_milestones if m not in existing_milestones]

    new_badges = []

    # Get location name from coordinates
    location_name = identify_location(latitude, longitude)

    # Special location names (Columbia University sponsors)
    special_locations = ["Columbia University", "Capital One", "An Ai World", "BlackRock", "Comet Opik", "Echo Merit Systems"]

    # Award a random badge for each missing milestone
    for milestone in missing_milestones:
        # Get badges for this location
        if location_name == "Columbia University":
            # For Columbia University, select from special sponsor locations
            location_badges = supabase.table("badges")\
                .select("*")\
                .in_("location_name", special_locations)\
                .execute()
        else:
            # For other locations, exclude special locations
            location_badges = supabase.table("badges")\
                .select("*")\
                .eq("location_name", location_name)\
                .not_().in_("location_name", special_locations)\
                .execute()

        if location_badges.data:
            # Randomly select a badge (random animal) from this location
            selected_badge = random.choice(location_badges.data)

            # Create user_badge record
            user_badge = supabase.table("user_badges").insert({
                "user_id": user_id,
                "badge_id": selected_badge["id"],
                "milestone": milestone
            }).execute()

            new_badges.append({
                "milestone": milestone,
                "badge": selected_badge,
                "awarded_at": user_badge.data[0]["earned_at"]
            })

    # Get total badge count
    total_badges_count = len(existing_milestones) + len(new_badges)

    return {
        "new_badges": new_badges,
        "total_badges": total_badges_count,
        "next_milestone": get_next_milestone(new_points)
    }


def get_user_badges(user_id: str) -> list:
    """Get all badges earned by a user"""

    supabase = _get_supabase()
    result = supabase.table("user_badges")\
        .select("*, badges(*)")\
        .eq("user_id", user_id)\
        .order("milestone")\
        .execute()

    return result.data


def update_user_points(user_id: str, points_to_add: int, latitude: float, longitude: float) -> dict:
    """
    Update user points and award badges if milestones reached

    Args:
        user_id: User's profile ID
        points_to_add: Points to add to current total
        latitude: User's current latitude
        longitude: User's current longitude

    Returns:
        dict: Updated profile with badge info
    """

    # Get current points
    supabase = _get_supabase()
    profile = supabase.table("profiles")\
        .select("points")\
        .eq("user_id", user_id)\
        .single()\
        .execute()

    current_points = profile.data.get("points", 0)
    new_points = current_points + points_to_add

    # Update points in database
    updated_profile = supabase.table("profiles")\
        .update({"points": new_points})\
        .eq("user_id", user_id)\
        .execute()

    # Award badges for new milestones
    badge_result = award_badges_for_points(user_id, new_points, latitude, longitude)

    return {
        "user_id": user_id,
        "previous_points": current_points,
        "new_points": new_points,
        "points_added": points_to_add,
        **badge_result
    }


# Example usage
if __name__ == "__main__":
    # Test the function
    test_user_id = "30c9d0b1-d84d-43ad-aa72-006cdda9c500"

    # Add 15 points (should trigger badges at 5, 10, 15)
    result = update_user_points(test_user_id, 15)
    print(f"Points updated: {result['new_points']}")
    print(f"New badges earned: {len(result['new_badges'])}")
    print(f"Next milestone at: {result['next_milestone']} points")

    # Get all user badges
    user_badges = get_user_badges(test_user_id)
    print(f"\nTotal badges: {len(user_badges)}")
