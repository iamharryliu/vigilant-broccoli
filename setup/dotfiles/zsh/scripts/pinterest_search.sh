#!/bin/bash
search_query=$(echo "$*" | sed 's/ /+/g')
search_url="https://www.pinterest.com/search/pins/?q=$search_query"
open "$search_url" >/dev/null 2>&1 &
