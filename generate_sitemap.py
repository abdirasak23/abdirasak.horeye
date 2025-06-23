#!/usr/bin/env python3
import os
import re
from datetime import datetime
from supabase import create_client, Client
from xml.etree import ElementTree as ET

# ── 1) Supabase client ─────────────────────────────────────────────────────────
SUPABASE_URL = "https://fpvuwegibnwucgxieirp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnV3ZWdpYm53dWNneGllaXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzU2NzEsImV4cCI6MjA1ODMxMTY3MX0.sOmvlv4vjV_EcXze0zYGZSolDst8rg5UqGkc1146Qxw"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── 2) Slug helper (must match your front-end) ────────────────────────────────
def create_slug(title: str) -> str:
    slug = title.lower().strip()
    # remove special chars
    slug = re.sub(r"[^\w\s-]", "", slug)
    # spaces/underscores → hyphens
    slug = re.sub(r"[\s_-]+", "-", slug)
    # trim leading/trailing hyphens
    return slug.strip("-")

# ── 3) Load existing sitemap (to keep your static URLs) ───────────────────────
def load_existing(url: str):
    tree = ET.parse(url)
    root = tree.getroot()
    # Remove any previously generated <url> entries that have a querystring,
    # so you don't duplicate on re-run.
    for elem in root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
        loc = elem.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
        if loc is not None and "ote?article=" in loc.text:
            root.remove(elem)
    return tree, root

# ── 4) Fetch articles & append new <url> entries ──────────────────────────────
def append_articles(root):
    # Fixed: Use desc=True instead of ascending=False
    # Fixed: Use created_at instead of updated_at since updated_at doesn't exist
    resp = supabase.table("Article")\
               .select("id, title, created_at")\
               .order("created_at", desc=True)\
               .execute()
    
    articles = resp.data
    base = "https://www.horeye.me/Articles"
    ns = {"": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    
    for art in articles:
        slug = create_slug(art["title"])
        loc_text = f"{base}/?article={slug}&id={art['id']}"
        url_el = ET.SubElement(root, "url")
        ET.SubElement(url_el, "loc").text = loc_text
        # Use created_at since updated_at doesn't exist
        lastmod = art.get("created_at") or datetime.utcnow().isoformat()
        ET.SubElement(url_el, "lastmod").text = lastmod
        ET.SubElement(url_el, "changefreq").text = "weekly"
        ET.SubElement(url_el, "priority").text = "0.6"

# ── 5) Write back to public/sitemap.xml ───────────────────────────────────────
def main():
    out_path = "sitemap.xml"
    tree, root = load_existing(out_path)
    append_articles(root)
    tree.write(out_path, encoding="utf-8", xml_declaration=True)
    print(f"✅ Updated sitemap with dynamic articles: {out_path}")

if __name__ == "__main__":
    main()