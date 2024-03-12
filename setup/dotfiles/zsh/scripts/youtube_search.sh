#!/bin/bash
search_query=$(echo "$*" | sed 's/ /+/g')
search_url="https://www.youtube.com/results?search_query=$search_query"
open "$search_url"
