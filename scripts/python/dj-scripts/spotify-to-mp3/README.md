# Spotify to MP3 Download

## Requirements

- Python

## Commands

```
# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
spotdl --download-ffmpeg

# Run script. Output path can be set by environment variable MUSIC_LIBRARY but by default is it '~/Spotify_to_MP3_Downloads'
python download_music.py

# Upgrade spotdl
pip install --upgrade spotdl
pip install --upgrade yt-dlp spotdl

# cronjob
0 */1 * * * cd ~/spotify-to-mp3/ && source venv/bin/activate && python download_music.py
```

**NOTE:** I personally set my MUSIC_LIBRARY environment variable to my Google Drive DJ music library and sync that bad boy up to all my machines so I can have my DJ playlists on the go.
