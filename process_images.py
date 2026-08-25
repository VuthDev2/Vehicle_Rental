import requests
import os
from rembg import remove
from PIL import Image
import io

images_to_process = {
    "scoopy": "https://upload.wikimedia.org/wikipedia/commons/3/36/Honda_Scoopy.jpg",
    "ranger": "https://upload.wikimedia.org/wikipedia/commons/5/54/2019_Ford_Ranger_XLT_Crew_Cab_4X4_front_11.2.19.jpg",
    "alphard": "https://upload.wikimedia.org/wikipedia/commons/8/87/2023_Toyota_Alphard_Executive_Lounge.jpg",
    "tuktuk": "https://upload.wikimedia.org/wikipedia/commons/0/05/Tuk-tuk_in_Phnom_Penh.jpg",
    "camry": "https://upload.wikimedia.org/wikipedia/commons/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg"
}

os.makedirs("public", exist_ok=True)

for name, url in images_to_process.items():
    print(f"Downloading {name}...")
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        input_image = response.content
        
        print(f"Removing background for {name}...")
        output_image = remove(input_image)
        
        img = Image.open(io.BytesIO(output_image))
        # Save as PNG
        out_path = f"public/real_{name}.png"
        img.save(out_path, format="PNG")
        print(f"Saved {out_path}")
    except Exception as e:
        print(f"Failed {name}: {e}")
