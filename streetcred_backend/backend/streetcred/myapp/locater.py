import os
from dotenv import load_dotenv

load_dotenv()

# Lazy import to avoid SSL errors on module load
_client = None

def _get_client():
    global _client
    if _client is None:
        from google import genai
        _client = genai.Client()
    return _client

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
    examples = """Battery Park City: [40.7150, -74.0165]
Civic Center: [40.7125, -74.0058]
Chinatown: [40.7162, -73.9968]
East Village: [40.7268, -73.9812]
Financial District: [40.7085, -74.0085]
Flatiron District: [40.7415, -73.9895]
Greenwich Village: [40.7340, -74.0032]
Little Italy: [40.7198, -73.9970]
Lower East Side: [40.7145, -73.9840]
Meatpacking District: [40.7425, -74.0080]
NoHo: [40.7278, -73.9940]
SoHo: [40.7238, -74.0035]
South Street Seaport: [40.7058, -74.0030]
Tribeca: [40.7168, -74.0090]
Union Square: [40.7362, -73.9915]
West Village: [40.7362, -74.0028]
Chelsea: [40.7470, -74.0018]
Garment District: [40.7545, -73.9910]
Gramercy Park: [40.7382, -73.9858]
Hell's Kitchen: [40.7642, -73.9922]
Hudson Yards: [40.7540, -74.0018]
Kips Bay: [40.7425, -73.9772]
Murray Hill: [40.7485, -73.9778]
Midtown: [40.7552, -73.9838]
NoMad: [40.7450, -73.9882]
Stuyvesant Town: [40.7315, -73.9765]
Times Square: [40.7585, -73.9858]
Turtle Bay: [40.7525, -73.9682]
Central Park: [40.7835, -73.9650]
East Harlem: [40.7962, -73.9385]
Fort George: [40.8572, -73.9362]
Hamilton Heights: [40.8240, -73.9505]
Harlem: [40.8122, -73.9460]
Hudson Heights: [40.8522, -73.9390]
Inwood: [40.8682, -73.9208]
Manhattan Valley: [40.7995, -73.9675]
Morningside Heights: [40.8115, -73.9628]
Upper East Side: [40.7742, -73.9562]
Upper West Side: [40.7878, -73.9758]
Washington Heights: [40.8508, -73.9345]
Yorkville: [40.7770, -73.9545]"""

    prompt = f"""You are a NYC geography expert. Here are the neighborhoods with their approximate center coordinates:

{examples}

Given these coordinates: [{latitude}, {longitude}]

Return ONLY the closest neighborhood name from the list above."""

    client = _get_client()
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

