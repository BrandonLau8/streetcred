from ninja import NinjaAPI, Schema
from typing import List, Optional
from datetime import datetime
from .badge_rewards import update_user_points, supabase
from .models import Report
from .report_image_upload import upload_report_image_base64

api = NinjaAPI(urls_namespace='reports')


# Request/Response Schemas
class CreateReportRequest(Schema):
    user_id: str
    lat: float
    lon: float
    description: str
    image_base64: Optional[str] = None  # Optional base64 encoded image
    image_extension: Optional[str] = "jpg"  # jpg, png, webp, etc.


class ReportResponse(Schema):
    id: int
    user_id: str
    lat: float
    lon: float
    description: str
    image_url: Optional[str] = None
    created_at: str


class CreateReportResponse(Schema):
    report: ReportResponse
    points_awarded: int
    new_points: int
    previous_points: int
    new_badges: List[dict]
    total_badges: int
    next_milestone: int


class GetReportsResponse(Schema):
    user_id: str
    total_reports: int
    reports: List[ReportResponse]


@api.post("/submit", response=CreateReportResponse)
def submit_report(request, payload: CreateReportRequest):
    """
    Submit a new report and automatically award 1 point to the user

    Process:
    1. Uploads image to Supabase Storage (if provided)
    2. Creates report in reports table
    3. Awards 1 point to user
    4. Checks for badge milestones
    5. Returns report + points/badge info
    """

    # Upload image if provided
    image_url = None
    if payload.image_base64:
        try:
            image_url = upload_report_image_base64(
                payload.image_base64,
                payload.user_id,
                payload.image_extension
            )
        except Exception as e:
            print(f"Image upload failed: {e}")
            # Continue without image rather than failing entire request

    # Create report in Supabase
    report_data = {
        "user_id": payload.user_id,
        "lat": payload.lat,
        "lon": payload.lon,
        "description": payload.description,
        "image_url": image_url
    }

    result = supabase.table("reports").insert(report_data).execute()

    if not result.data:
        raise Exception("Failed to create report")

    created_report = result.data[0]

    # Award 1 point and check for badges
    points_result = update_user_points(payload.user_id, 1)

    return {
        "report": {
            "id": created_report["id"],
            "user_id": created_report["user_id"],
            "lat": created_report["lat"],
            "lon": created_report["lon"],
            "description": created_report["description"],
            "image_url": created_report.get("image_url"),
            "created_at": created_report["created_at"]
        },
        "points_awarded": 1,
        "new_points": points_result["new_points"],
        "previous_points": points_result["previous_points"],
        "new_badges": points_result["new_badges"],
        "total_badges": points_result["total_badges"],
        "next_milestone": points_result["next_milestone"]
    }


@api.get("/user/{user_id}", response=GetReportsResponse)
def get_user_reports(request, user_id: str):
    """
    Get all reports submitted by a specific user
    """

    result = supabase.table("reports")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()

    reports = result.data if result.data else []

    return {
        "user_id": user_id,
        "total_reports": len(reports),
        "reports": reports
    }


@api.get("/recent", response=List[ReportResponse])
def get_recent_reports(request, limit: int = 20):
    """
    Get recent reports from all users
    """

    result = supabase.table("reports")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()

    return result.data if result.data else []


@api.get("/nearby")
def get_nearby_reports(request, lat: float, lon: float, radius_km: float = 1.0):
    """
    Get reports near a specific location

    Note: This is a simple implementation. For production, consider using PostGIS.
    """
    import math

    # Get all reports (in production, you'd want to add spatial indexing)
    result = supabase.table("reports")\
        .select("*")\
        .execute()

    nearby_reports = []

    if result.data:
        for report in result.data:
            # Calculate distance using Haversine formula
            lat1, lon1 = math.radians(lat), math.radians(lon)
            lat2, lon2 = math.radians(report["lat"]), math.radians(report["lon"])

            dlat = lat2 - lat1
            dlon = lon2 - lon1

            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance_km = 6371 * c  # Earth's radius in km

            if distance_km <= radius_km:
                nearby_reports.append({
                    **report,
                    "distance_km": round(distance_km, 2)
                })

    # Sort by distance
    nearby_reports.sort(key=lambda x: x["distance_km"])

    return {
        "lat": lat,
        "lon": lon,
        "radius_km": radius_km,
        "total_reports": len(nearby_reports),
        "reports": nearby_reports
    }
