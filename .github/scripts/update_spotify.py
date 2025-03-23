import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
import base64
import requests
from datetime import datetime
import re

# Spotify API credentials
SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REFRESH_TOKEN = os.environ.get('SPOTIFY_REFRESH_TOKEN')

# Initialize Spotify client - Updated with 127.0.0.1 instead of localhost
sp = spotipy.Spotify(auth_manager=spotipy.oauth2.SpotifyOAuth(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET,
    redirect_uri='http://127.0.0.1:8000',  # Changed from localhost to 127.0.0.1
    scope='user-read-recently-played',
))

# Get recently played tracks
results = sp.current_user_recently_played(limit=5)

# Create markdown content
markdown = "## 🎵 Recently Played Tracks\n\n"

for idx, item in enumerate(results['items']):
    track = item['track']
    artists = ', '.join([artist['name'] for artist in track['artists']])
    album_name = track['album']['name']
    track_name = track['name']
    track_url = track['external_urls']['spotify']
    played_at = datetime.strptime(item['played_at'], '%Y-%m-%dT%H:%M:%S.%fZ')
    played_at_str = played_at.strftime('%Y-%m-%d %H:%M')
    
    try:
        # Try to get album art
        album_art = track['album']['images'][0]['url']
        
        # Download the image
        response = requests.get(album_art)
        if response.status_code == 200:
            album_art_base64 = base64.b64encode(response.content).decode('utf-8')
            markdown += f"<img src='data:image/jpeg;base64,{album_art_base64}' width='60' height='60' alt='{album_name}' style='float:left; margin-right:10px;' />\n\n"
    except (KeyError, IndexError, requests.RequestException):
        # If any error occurs, skip the album art
        pass
    
    markdown += f"**{track_name}** - {artists}\n\n"
    markdown += f"*Album: {album_name}*\n\n"
    markdown += f"[Listen on Spotify]({track_url}) • {played_at_str}\n\n"
    markdown += "---\n\n" if idx < len(results['items']) - 1 else ""

# Update README.md
readme_path = 'README.md'
with open(readme_path, 'r', encoding='utf-8') as file:
    readme = file.read()

# Define patterns for replacement (customize these to match your README structure)
start_tag = '<!-- SPOTIFY_RECENTLY_PLAYED:START -->'
end_tag = '<!-- SPOTIFY_RECENTLY_PLAYED:END -->'

# If the tags don't exist, create them
if start_tag not in readme or end_tag not in readme:
    print("Tags not found in README. Adding them...")
    # Add at the end if tags not found
    if '## 🔄 Latest Jammin\' Session' in readme:
        # Find the section and add after it
        section_index = readme.find('## 🔄 Latest Jammin\' Session')
        section_end = readme.find('\n\n', section_index)
        if section_end == -1:
            section_end = len(readme)
        
        insert_point = section_end
        new_content = f"\n\n{start_tag}\n{markdown}\n{end_tag}"
        readme = readme[:insert_point] + new_content + readme[insert_point:]
    else:
        # Just append at the end
        readme += f"\n\n## 🔄 Latest Jammin' Session\n\n{start_tag}\n{markdown}\n{end_tag}\n"
else:
    # Replace content between tags
    pattern = f"{start_tag}.*?{end_tag}"
    replacement = f"{start_tag}\n{markdown}\n{end_tag}"
    readme = re.sub(pattern, replacement, readme, flags=re.DOTALL)

# Write updated README
with open(readme_path, 'w', encoding='utf-8') as file:
    file.write(readme)

print("README updated with recently played tracks")
