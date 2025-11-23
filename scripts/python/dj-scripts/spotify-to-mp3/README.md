# Spotify to MP3 Download

Follow instructions inside [.env.example](.env.example) to setup environment variables.

```
# Setup environment variables.
cp .env.example .env

# Install dependencies.
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
spotdl --download-ffmpeg

# Run script.
python download_music.py
python download_music.py --help
pythong download_music.py --filter FILTER --output OUTPUT --parallel PARALLEL

# Run performance tests.
python performance_test.py

# Upgrade dependencies.
pip install --upgrade spotdl yt-dlp ytmusicapi

# Example cronjob.
0 */1 * * * cd ~/spotify-to-mp3/ && source venv/bin/activate && python download_music.py -f mix
```
