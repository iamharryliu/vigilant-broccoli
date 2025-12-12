#!/bin/bash

# Usage: web_search.sh <site> [search terms]
# Example: web_search.sh youtube cats playing piano

site="$1"
shift

case "$site" in
    youtube)
        base_url="https://www.youtube.com/"
        search_url="https://www.youtube.com/results?search_query="
        ;;
    reddit)
        base_url="https://www.reddit.com/"
        search_url="https://www.reddit.com/search/?q="
        ;;
    google)
        base_url="https://www.google.com/"
        search_url="https://www.google.com/search?q="
        ;;
    amazon)
        base_url="https://www.amazon.ca/"
        search_url="https://www.amazon.ca/s?k="
        ;;
    pinterest)
        base_url="https://www.pinterest.com/"
        search_url="https://www.pinterest.com/search/pins/?q="
        ;;
    chatgpt)
        base_url="https://chatgpt.com/"
        search_url="https://chatgpt.com/?q="
        ;;
    *)
        echo "Unknown site: $site"
        exit 1
        ;;
esac

if [ -z "$1" ]; then
    open "$base_url"
else
    # Use %20 for chatgpt, + for others
    if [ "$site" = "chatgpt" ]; then
        search_query=$(echo "$*" | sed 's/ /%20/g')
    else
        search_query=$(echo "$*" | sed 's/ /+/g')
    fi
    open "${search_url}${search_query}"
fi
