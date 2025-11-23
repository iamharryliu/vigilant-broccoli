# Spotify to MP3 Download

## Requirements

- Python
- Spotify Developer Account (for API access)

## Commands

```
# Setup
# Get Spotify API Credentials
# 1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
# 2. Log in with your Spotify account
# 3. Click "Create an App"
# 4. Fill in the app name and description
# 5. Copy the **Client ID** and **Client Secret**
# 6. Click "Edit Settings" and add `http://127.0.0.1:8888/callback` to the Redirect URIs
# Environment variables.
cp .env.example .env
# Install dependencies.
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
spotdl --download-ffmpeg

python download_music.py
python download_music.py --help
pythong download_music.py --filter FILTER --output OUTPUT --parallel PARALLEL

python performance_test.py

# Upgrade spotdl and dependencies
pip install --upgrade spotdl yt-dlp ytmusicapi

# Setup cronjob (runs every hour)
0 */1 * * * cd ~/spotify-to-mp3/ && source venv/bin/activate && python download_music.py
```

**NOTE:** I personally set my MUSIC_LIBRARY environment variable to my Google Drive DJ music library and sync that bad boy up to all my machines so I can have my DJ playlists on the go.
