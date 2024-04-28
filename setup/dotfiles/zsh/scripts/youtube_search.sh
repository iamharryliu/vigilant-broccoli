#!/bin/bash

if [ -z "$1" ]; then
    open "https://www.youtube.com/"
else
    search_query=$(echo "$*" | sed 's/ /+/g')
    search_url="https://www.youtube.com/results?search_query=$search_query"
    open "$search_url"
fi
