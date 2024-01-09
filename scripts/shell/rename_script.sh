#!/bin/bash

# Check if correct number of arguments is provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <directory_path> <substring_to_replace> <replacement_string>"
    exit 1
fi

# Store arguments in variables
directory="$1"
substring="$2"
replacement="$3"

# Check if the directory exists
if [ ! -d "$directory" ]; then
    echo "Directory '$directory' not found."
    exit 1
fi

# Navigate to the target directory
cd "$directory" || exit

# Loop through files in the directory
for file in *; do
    # Check if the file name contains the specified substring
    if [[ "$file" == *"$substring"* ]]; then
        # Replace the substring with the replacement string in the file name
        new_file="${file//$substring/$replacement}"
        # Rename the file
        mv "$file" "$new_file"
        echo "Renamed '$file' to '$new_file'"
    fi
done
