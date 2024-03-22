# Spotify to MP3 Download

## Requirements

- Python

## Setup and Run (for Mac)

Setup

```
cd ~
git clone https://github.com/iamharryliu/spotify-to-mp3.git
cd spotify-to-mp3

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
spotdl --download-ffmpeg
```

Execute Script

```
python download_music.py
```

Cronjob for keeping playlists in sync. I personally set my MUSIC_LIBRARY environment variable to my Google Drive DJ music library and sync that bad boy up to all my machines so I can have my DJ playlists on the go.

```
crontab -e
0 */1 * * * cd ~/spotify-to-mp3/ && source venv/bin/activate && python download_music.py
```
