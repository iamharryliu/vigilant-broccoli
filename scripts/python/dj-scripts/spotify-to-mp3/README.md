# Spotify to MP3 Download

Follow instructions inside [.env.example](.env.example) to setup environment variables.

```
# Setup environment variables.
cp .env.example .env

# Install dependencies (mise install first, so `python` is the repo-pinned version
# from mise.toml rather than whatever Homebrew last linked).
mise install
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
spotdl --download-ffmpeg
spotdl --download-deno

# Run script.
python download_music.py
python download_music.py --help
python download_music.py --filter FILTER --output OUTPUT --parallel PARALLEL

# Run performance tests.
python performance_test.py

# Upgrade dependencies.
pip install --upgrade spotdl yt-dlp ytmusicapi

# Many "failed tracks" in the run summary (HTTP 403 from YouTube): upgrade the
# line above first, then try removing or changing the `player_client` in
# SPOTDL_YT_DLP_ARGS (spotify_to_mp3_service.py).

# Example cronjob.
0 */1 * * * cd ~/spotify-to-mp3/ && source venv/bin/activate && python download_music.py -f mix
```
