import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def extract_info_from_filename(file_path: str):
    """Extract location_name and animal from filename"""
    # Get filename without path and extension
    # Example: "gen_images/Times_Square_rat.png" -> "Times_Square_rat"
    base_name = os.path.splitext(os.path.basename(file_path))[0]

    # Split by underscore
    parts = base_name.split('_')

    # Last part is the animal, rest is location
    animal = parts[-1]
    location_name = ' '.join(parts[:-1])

    return location_name, animal

def upload_image_to_storage(file_path: str, bucket_name: str = "badges"):
    """Upload image to Supabase Storage and return public URL"""

    file_name = os.path.basename(file_path)

    # Upload to storage
    with open(file_path, 'rb') as f:
        response = supabase.storage.from_(bucket_name).upload(
            path=f"generated/{file_name}",
            file=f,
            file_options={"content-type": "image/png", "upsert": "true"}
        )

    # Get public URL
    public_url = supabase.storage.from_(bucket_name).get_public_url(f"generated/{file_name}")

    return public_url

def save_badge_to_table(image_url: str, location_name: str, animal: str):
    """Save badge to badges table"""

    data = {
        "image_url": image_url,
        "location_name": location_name,
        "animal": animal
    }

    response = supabase.table("badges").insert(data).execute()
    return response.data

# Example usage
if __name__ == "__main__":
    import glob

    # Get all PNG files in gen_images folder
    image_files = glob.glob("gen_images/*.png")

    print(f"Found {len(image_files)} images to upload\n")

    for image_path in image_files:
        try:
            # Extract info from filename
            location_name, animal = extract_info_from_filename(image_path)
            print(f"Processing: {image_path}")
            print(f"  - Location: {location_name}, Animal: {animal}")

            # Upload to storage
            image_url = upload_image_to_storage(image_path)
            print(f"  - Uploaded: {image_url}")

            # Save to badges table
            result = save_badge_to_table(
                image_url=image_url,
                animal=animal,
                location_name=location_name
            )
            print(f"  ✓ Saved to badges table\n")

        except Exception as e:
            print(f"  ✗ Error: {e}\n")
