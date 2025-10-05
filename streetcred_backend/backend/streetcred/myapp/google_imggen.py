import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client()

# prompt = """Based on the list of places:
# Battery Park City, Civic Center, Chinatown, East Village, Financial District, Flatiron District, Greenwich Village, Little Italy, Lower East Side, Meatpacking District, NoHo, SoHo, South Street Seaport, Tribeca, Union Square, West Village, Chelsea, Garment District, Gramercy Park, Hell's Kitchen, Hudson Yards, Kips Bay, Murray Hill, Midtown, NoMad, Stuyvesant Town, Times Square, Turtle Bay, Central Park, East Harlem, Fort George, Hamilton Heights, Harlem, Hudson Heights, Inwood, Manhattan Valley, Morningside Heights, Upper East Side, Upper West Side, Washington Heights, Yorkville

# Where am I? [40.7580, -73.9855]
# """

#   - Times Square: 40.7580, -73.9855
#   - Central Park: 40.7829, -73.9654
#   - Greenwich Village: 40.7336, -73.9981
#   - Chinatown: 40.7157, -73.9970
#   - Financial District: 40.7074, -74.0113
#   - Upper East Side: 40.7736, -73.9566



# # First prompt: Get location name
# text_response = client.models.generate_content(
#     model="gemini-2.0-flash-exp",  # Use text model
#     contents=prompt,
# )

# location_name = text_response.text.strip()
# print(f"Location identified: {location_name}")

# # Second prompt: Generate image using the location name
# # image_prompt = f"make a cartoon character badge of either a: rat, pigeon, squirrel, skunk, raccoon, dog, cat from {location_name}, New York City"

# image_response = client.models.generate_content(
#     model="gemini-2.5-flash-image",
#     contents=image_prompt,
# )

# for part in image_response.candidates[0].content.parts:
#     if part.text is not None:
#         print(part.text)
#     elif part.inline_data is not None:
#         image = Image.open(BytesIO(part.inline_data.data))
#         image.save("generated_image.png")
#         print("Image saved!")

# ========== AUTOMATED GENERATION ==========
# Arrays for automation
locations = [
    "Times Square",
    "Central Park",
    "Greenwich Village",
    "Chinatown",
    "Financial District",
    "Upper East Side"
]

animals = ["rat", "pigeon", "squirrel", "skunk", "raccoon", "dog", "cat"]

remaining_locations = [
    # "Battery Park City",
    # "Civic Center",
    # "East Village",
    # "Flatiron District",
    # "Little Italy",
    "Lower East Side",
    "Meatpacking District",
    "NoHo",
    "SoHo",
    "South Street Seaport",
    "Tribeca",
    "Union Square",
    "West Village",
    "Chelsea",
    "Garment District",
    "Gramercy Park",
    "Hell's Kitchen",
    "Hudson Yards",
    "Kips Bay",
    "Murray Hill",
    "Midtown",
    "NoMad",
    "Stuyvesant Town",
    "Turtle Bay",
    "East Harlem",
    "Fort George",
    "Hamilton Heights",
    "Harlem",
    "Hudson Heights",
    "Inwood",
    "Manhattan Valley",
    "Morningside Heights",
    "Upper West Side",
    "Washington Heights",
    "Yorkville"
]

# Generate images for each location and animal combination
for location_name in remaining_locations:
    for animal in animals:
        print(f"\nGenerating {animal} badge for {location_name}...")

        # Generate image
        image_prompt = f"make a cartoon character badge of a {animal} from {location_name}, New York City"

        image_response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=image_prompt,
        )

        # Save image with unique filename
        for part in image_response.candidates[0].content.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                image = Image.open(BytesIO(part.inline_data.data))
                filename = f"gen_images/{location_name.replace(' ', '_')}_{animal}.png"
                image.save(filename)
                print(f"✓ Saved: {filename}")

# ========== AUTOMATED GENERATION ==========