import os
from dotenv import load_dotenv
from supabase import create_client, Client
import random

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

user_id = "a1f30266-3ffc-49d3-8ea5-fb3f78a79361"

# Different locations for each milestone
milestone_locations = {
    5: "Central Park",
    10: "Greenwich Village",
    15: "Chinatown",
    20: "SoHo",
    25: "Chelsea",
    30: "Upper East Side",
    35: "Harlem",
    40: "East Village",
    45: "Financial District"
}

print(f"Reassigning badges for user {user_id}...\n")

for milestone, location in milestone_locations.items():
    # Get a random badge from this location
    badges = supabase.table("badges")\
        .select("id")\
        .eq("location_name", location)\
        .execute()

    if badges.data:
        # Pick random badge
        random_badge = random.choice(badges.data)
        badge_id = random_badge["id"]

        # Update user_badge
        result = supabase.table("user_badges")\
            .update({"badge_id": badge_id})\
            .eq("user_id", user_id)\
            .eq("milestone", milestone)\
            .execute()

        if result.data:
            print(f"✓ Milestone {milestone}: Updated to {location} (badge_id: {badge_id})")
        else:
            print(f"! Milestone {milestone}: Update returned no data - {result}")
    else:
        print(f"✗ Milestone {milestone}: No badges found for {location}")

print("\nDone! Fetching updated badges...")

# Get updated badges
updated_badges = supabase.table("user_badges")\
    .select("milestone, badges(location_name, animal)")\
    .eq("user_id", user_id)\
    .order("milestone")\
    .execute()

print("\nUpdated Badge Summary:")
for badge in updated_badges.data:
    print(f"  Milestone {badge['milestone']}: {badge['badges']['animal']} from {badge['badges']['location_name']}")
