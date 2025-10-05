from ninja import NinjaAPI, Schema
from typing import List, Optional
from .badge_rewards import update_user_points, get_user_badges, award_badges_for_points

api = NinjaAPI(urls_namespace='badges')


# Request/Response Schemas
class AddPointsRequest(Schema):
    user_id: str
    points: int
    latitude: float
    longitude: float


class BadgeInfo(Schema):
    id: int
    animal: str
    location_name: str
    image_url: str


class NewBadgeAward(Schema):
    milestone: int
    badge: BadgeInfo
    awarded_at: str


class AddPointsResponse(Schema):
    user_id: str
    previous_points: int
    new_points: int
    points_added: int
    new_badges: List[NewBadgeAward]
    total_badges: int
    next_milestone: int


class UserBadgeResponse(Schema):
    milestone: int
    badge_id: int
    earned_at: str
    badges: BadgeInfo


@api.post("/add-points", response=AddPointsResponse)
def add_points(request, payload: AddPointsRequest):
    """
    Add points to user and automatically award badges at milestones

    Badges are awarded based on user's current location
    Milestones: Every 5 points (5, 10, 15, 20, etc.)
    """
    result = update_user_points(
        payload.user_id,
        payload.points,
        payload.latitude,
        payload.longitude
    )
    return result


@api.post("/check-milestones")
def check_milestones(request, user_id: str, points: int, latitude: float, longitude: float):
    """
    Check and award any missing badges for user's current points

    Useful for backfilling badges if points were added outside the system
    """
    result = award_badges_for_points(user_id, points, latitude, longitude)
    return result


@api.get("/user-badges/{user_id}")
def get_badges(request, user_id: str):
    """
    Get all badges earned by a user
    """
    try:
        badges = get_user_badges(user_id)
        return {
            "user_id": user_id,
            "total_badges": len(badges),
            "badges": badges
        }
    except Exception as e:
        print(f"Error in get_badges: {e}")
        import traceback
        traceback.print_exc()
        raise


@api.get("/badge-progress/{user_id}")
def get_badge_progress(request, user_id: str):
    """
    Get user's badge earning progress
    """
    from myapp.badge_rewards import supabase, get_next_milestone, get_earned_milestones

    # Get current points
    profile = supabase.table("profiles")\
        .select("points")\
        .eq("user_id", user_id)\
        .single()\
        .execute()

    points = profile.data.get("points", 0)
    earned_milestones = get_earned_milestones(points)

    # Get earned badges count
    badges = get_user_badges(user_id)

    next_milestone = get_next_milestone(points)
    points_to_next = next_milestone - points

    return {
        "user_id": user_id,
        "current_points": points,
        "total_badges": len(badges),
        "milestones_reached": len(earned_milestones),
        "next_milestone": next_milestone,
        "points_to_next_badge": points_to_next,
        "progress_percent": ((points % 5) / 5) * 100
    }
