#!/bin/bash

IP_ADDRESS="8.8.8.8"
PING_COUNT=1
ping -c $PING_COUNT $IP_ADDRESS > /dev/null 2>&1

if [ $? -eq 0 ]; then
    # DEBUG LINE
    # echo "Ping to $IP_ADDRESS successful. Executing $0"
    cd ~/$REPO_NAME/scripts/python/dj-scripts/spotify-to-mp3 && source venv/bin/activate && python download_music.py
else
    echo "Ping to $IP_ADDRESS failed. Aborting the script execution."
fi
