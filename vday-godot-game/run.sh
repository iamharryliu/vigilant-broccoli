#!/bin/bash

if command -v godot &> /dev/null; then
    echo "Opening project in Godot..."
    godot --path . --editor
elif [ -d "/Applications/Godot.app" ]; then
    echo "Opening project with Godot.app..."
    open -a Godot --args --path . --editor
else
    echo "Godot not found. Please:"
    echo "1. Open Godot Engine"
    echo "2. Click 'Import'"
    echo "3. Navigate to this directory and select project.godot"
    echo "4. Click 'Import & Edit'"
fi
