import os
import shutil
from PIL import Image

def process_logos():
    src_dir = os.path.abspath("assets/logos")
    public_dir = os.path.abspath("frontend/public")
    logos_dir = os.path.join(public_dir, "logos")
    app_dir = os.path.abspath("frontend/app")

    os.makedirs(logos_dir, exist_ok=True)

    # 1. Copy original logos to frontend/public/logos
    full_logo_src = os.path.join(src_dir, "HyperResume-Full-Logo.png")
    icon_logo_src = os.path.join(src_dir, "HypeResume-Icon-Logo.png")
    text_logo_src = os.path.join(src_dir, "text-logo.png")

    shutil.copy2(full_logo_src, os.path.join(logos_dir, "HyperResume-Full-Logo.png"))
    shutil.copy2(icon_logo_src, os.path.join(logos_dir, "HypeResume-Icon-Logo.png"))
    shutil.copy2(text_logo_src, os.path.join(logos_dir, "text-logo.png"))

    # Also standardized convenient filenames
    shutil.copy2(full_logo_src, os.path.join(logos_dir, "logo-full.png"))
    shutil.copy2(icon_logo_src, os.path.join(logos_dir, "logo-icon.png"))
    shutil.copy2(text_logo_src, os.path.join(logos_dir, "logo-text.png"))

    print("Copied logos to frontend/public/logos/")

    # 2. Process Icon for Favicon and Web Icons
    icon_img = Image.open(icon_logo_src).convert("RGBA")
    bbox = icon_img.getbbox()
    cropped = icon_img.crop(bbox)

    # Place on square canvas with subtle 4% padding for clean favicon viewing
    max_dim = max(cropped.width, cropped.height)
    canvas_size = int(max_dim * 1.08)
    square_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset = ((canvas_size - cropped.width) // 2, (canvas_size - cropped.height) // 2)
    square_canvas.paste(cropped, offset, cropped)

    # Generate multi-size favicon.ico
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    ico_path_public = os.path.join(public_dir, "favicon.ico")
    ico_path_app = os.path.join(app_dir, "favicon.ico")

    square_canvas.save(ico_path_public, format="ICO", sizes=ico_sizes)
    square_canvas.save(ico_path_app, format="ICO", sizes=ico_sizes)
    print(f"Generated favicon.ico at {ico_path_public} and {ico_path_app}")

    # Generate PNG icons (Apple touch icon, web app icon, next.js icon)
    apple_icon = square_canvas.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save(os.path.join(app_dir, "apple-icon.png"), "PNG")
    apple_icon.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

    icon_32 = square_canvas.resize((32, 32), Image.Resampling.LANCZOS)
    icon_32.save(os.path.join(app_dir, "icon.png"), "PNG")

    icon_192 = square_canvas.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

    icon_512 = square_canvas.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")
    print("Generated web PNG icons: apple-icon.png, icon.png, icon-192.png, icon-512.png")

if __name__ == "__main__":
    process_logos()
