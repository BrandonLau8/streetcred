import os
import uuid
import base64
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

BUCKET_NAME = "report_images"


def upload_report_image_base64(base64_image: str, user_id: str, file_extension: str = "jpg") -> str:
    """
    Upload a base64 encoded image to Supabase Storage

    Args:
        base64_image: Base64 encoded image string (with or without data:image prefix)
        user_id: User ID for organizing files
        file_extension: Image file extension (jpg, png, webp, etc.)

    Returns:
        str: Public URL of uploaded image
    """

    # Remove data URL prefix if present
    if "base64," in base64_image:
        base64_image = base64_image.split("base64,")[1]

    # Decode base64 to bytes
    image_bytes = base64.b64decode(base64_image)

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{user_id}/{timestamp}_{unique_id}.{file_extension}"

    # Upload to Supabase Storage
    result = supabase.storage.from_(BUCKET_NAME).upload(
        filename,
        image_bytes,
        file_options={"content-type": f"image/{file_extension}"}
    )

    # Get public URL
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)

    return public_url


def upload_report_image_file(file_path: str, user_id: str) -> str:
    """
    Upload an image file to Supabase Storage

    Args:
        file_path: Path to the image file
        user_id: User ID for organizing files

    Returns:
        str: Public URL of uploaded image
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # Get file extension
    file_extension = os.path.splitext(file_path)[1][1:]  # Remove the dot

    # Read file bytes
    with open(file_path, "rb") as f:
        image_bytes = f.read()

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{user_id}/{timestamp}_{unique_id}.{file_extension}"

    # Upload to Supabase Storage
    result = supabase.storage.from_(BUCKET_NAME).upload(
        filename,
        image_bytes,
        file_options={"content-type": f"image/{file_extension}"}
    )

    # Get public URL
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)

    return public_url


def upload_report_image_bytes(image_bytes: bytes, user_id: str, file_extension: str = "jpg") -> str:
    """
    Upload image bytes directly to Supabase Storage

    Args:
        image_bytes: Image data as bytes
        user_id: User ID for organizing files
        file_extension: Image file extension (jpg, png, webp, etc.)

    Returns:
        str: Public URL of uploaded image
    """

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{user_id}/{timestamp}_{unique_id}.{file_extension}"

    # Upload to Supabase Storage
    result = supabase.storage.from_(BUCKET_NAME).upload(
        filename,
        image_bytes,
        file_options={"content-type": f"image/{file_extension}"}
    )

    # Get public URL
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)

    return public_url


def delete_report_image(image_url: str) -> bool:
    """
    Delete a report image from Supabase Storage

    Args:
        image_url: Public URL of the image to delete

    Returns:
        bool: True if successful
    """

    # Extract filename from URL
    # URL format: https://{project}.supabase.co/storage/v1/object/public/report_images/{filename}
    filename = image_url.split(f"/object/public/{BUCKET_NAME}/")[-1]

    try:
        supabase.storage.from_(BUCKET_NAME).remove([filename])
        return True
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False


# Example usage
if __name__ == "__main__":
    # Test base64 upload
    test_user_id = "test-user-123"

    # Example: Upload from file
    # public_url = upload_report_image_file("test_image.jpg", test_user_id)
    # print(f"Uploaded image: {public_url}")

    print("Report image upload utilities ready")
    print(f"Bucket: {BUCKET_NAME}")
    print(f"Supabase URL: {supabase_url}")
