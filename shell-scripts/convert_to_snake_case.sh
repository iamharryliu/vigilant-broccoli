#!/bin/bash

# Check if correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

# Store argument in variable
directory="$1"

# Check if the directory exists
if [ ! -d "$directory" ]; then
    echo "Directory '$directory' not found."
    exit 1
fi

# Loop through files in the directory and its subdirectories
find "$directory" -type f -print0 | while IFS= read -r -d '' file; do
    # Get the filename without the path
    filename=$(basename "$file")

    # Convert camelCase to snake_case
    new_file=$(echo "$filename" | sed 's/\([a-z0-9]\)\([A-Z]\)/\1_\2/g' | sed 's/\([A-Z]\{2,\}\)\([A-Z][a-z]\)/\1_\2/g' | tr '[:upper:]' '[:lower:]')

    # Rename the file if the names are different
    if [ "$filename" != "$new_file" ]; then
        mv "$file" "$(dirname "$file")/$new_file"
        echo "Renamed '$filename' to '$(dirname "$file")/$new_file'"
    fi
done
