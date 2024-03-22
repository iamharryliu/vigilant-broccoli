# Spotify to MP3 Download

## Requirements

- Python

## Setup and Run (for Mac)

Commands

```
# Setup
cd ~
git clone https://github.com/iamharryliu/spotify-to-mp3.git
cd spotify-to-mp3

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
spotdl --download-ffmpeg

# Execute Script
python download_music.py

# Cronjob for keeping playlists in sync.
crontab -e
0 */1 * * * cd ~/spotify-to-mp3/ && source venv/bin/activate && python download_music.py
```
