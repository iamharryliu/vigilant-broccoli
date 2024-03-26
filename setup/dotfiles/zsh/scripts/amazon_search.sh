#!/bin/bash
search_query=$(echo "$*" | sed 's/ /+/g')
search_url="https://www.amazon.ca/s?k=$search_query"
open "$search_url"
