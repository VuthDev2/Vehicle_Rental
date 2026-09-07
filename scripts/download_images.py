from duckduckgo_search import DDGS
import requests
import os

vehicles = [
    {"name": "scoopy", "query": "Honda Scoopy transparent background png"},
    {"name": "highlander", "query": "Toyota Highlander transparent background png"},
    {"name": "ranger", "query": "Ford Ranger transparent background png"},
    {"name": "alphard", "query": "Toyota Alphard transparent background png"},
    {"name": "tuktuk", "query": "Cambodia Tuk Tuk transparent background png"}
]

ddgs = DDGS()
os.makedirs("public", exist_ok=True)

for v in vehicles:
    print(f"Searching for {v['name']}...")
    try:
        results = list(ddgs.images(
            v["query"],
            region="wt-wt",
            safesearch="moderate",
            size="Large",
            color="Transparent",
            max_results=3
        ))
        for res in results:
            url = res['image']
            try:
                print(f"Downloading {url}")
                img_data = requests.get(url, timeout=5).content
                with open(f"public/{v['name']}.png", "wb") as f:
                    f.write(img_data)
                print(f"Saved {v['name']}.png")
                break
            except Exception as e:
                print(f"Failed to download: {e}")
    except Exception as e:
        print(f"Error searching: {e}")
