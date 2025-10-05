import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client()

# List of NYC neighborhoods
NYC_NEIGHBORHOODS = [
    "Battery Park City", "Civic Center", "Chinatown", "East Village",
    "Financial District", "Flatiron District", "Greenwich Village",
    "Little Italy", "Lower East Side", "Meatpacking District", "NoHo",
    "SoHo", "South Street Seaport", "Tribeca", "Union Square", "West Village",
    "Chelsea", "Garment District", "Gramercy Park", "Hell's Kitchen",
    "Hudson Yards", "Kips Bay", "Murray Hill", "Midtown", "NoMad",
    "Stuyvesant Town", "Times Square", "Turtle Bay", "Central Park",
    "East Harlem", "Fort George", "Hamilton Heights", "Harlem",
    "Hudson Heights", "Inwood", "Manhattan Valley", "Morningside Heights",
    "Upper East Side", "Upper West Side", "Washington Heights", "Yorkville"
]

def identify_location(latitude: float, longitude: float) -> str:
    """
    Identify NYC neighborhood from coordinates using Gemini AI

    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate

    Returns:
        str: Neighborhood name
    """
    examples = """Battery Park City: [40.7157, -74.0154]
Civic Center: [40.7142, -74.0064]
Chinatown: [40.7157, -73.9970]
East Village: [40.7265, -73.9815]
Financial District: [40.7074, -74.0113]
Flatiron District: [40.7411, -73.9897]
Greenwich Village: [40.7336, -73.9981]
Little Italy: [40.7193, -73.9973]
Lower East Side: [40.7168, -73.9861]
Meatpacking District: [40.7410, -74.0062]
NoHo: [40.7273, -73.9943]
SoHo: [40.7233, -74.0030]
South Street Seaport: [40.7070, -74.0033]
Tribeca: [40.7163, -74.0086]
Union Square: [40.7359, -73.9911]
West Village: [40.7358, -74.0023]
Chelsea: [40.7465, -74.0014]
Garment District: [40.7540, -73.9912]
Gramercy Park: [40.7378, -73.9862]
Hell's Kitchen: [40.7638, -73.9918]
Hudson Yards: [40.7536, -74.0014]
Kips Bay: [40.7420, -73.9776]
Murray Hill: [40.7479, -73.9781]
Midtown: [40.7549, -73.9840]
NoMad: [40.7446, -73.9879]
Stuyvesant Town: [40.7311, -73.9769]
Times Square: [40.7580, -73.9855]
Turtle Bay: [40.7520, -73.9686]
Central Park: [40.7829, -73.9654]
East Harlem: [40.7957, -73.9389]
Fort George: [40.8566, -73.9366]
Hamilton Heights: [40.8234, -73.9500]
Harlem: [40.8116, -73.9465]
Hudson Heights: [40.8517, -73.9394]
Inwood: [40.8677, -73.9212]
Manhattan Valley: [40.7989, -73.9680]
Morningside Heights: [40.8108, -73.9632]
Upper East Side: [40.7736, -73.9566]
Upper West Side: [40.7870, -73.9754]
Washington Heights: [40.8501, -73.9350]
Yorkville: [40.7765, -73.9549]"""

    prompt = f"""You are a NYC geography expert. Here are the neighborhoods with their approximate center coordinates:

{examples}

Given these coordinates: [{latitude}, {longitude}]

Return ONLY the closest neighborhood name from the list above."""

    text_response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt,
    )

    location_name = text_response.text.strip()
    return location_name

# Example usage
if __name__ == "__main__":
    # Test with Times Square coordinates
    lat, lng = 40.7580, -73.9855
    location = identify_location(lat, lng)
    print(f"Location identified: {location}")

