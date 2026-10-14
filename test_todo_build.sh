#!/bin/bash

# Test that the todo app can be built successfully
echo "Testing todo app build..."

cd /home/agent/vigilant-broccoli/projects/nx-workspace

# Try to run the build command for our new app
pnpm nx build todo-app --configuration=production

if [ $? -eq 0 ]; then
    echo "✅ Todo app builds successfully"
else
    echo "❌ Todo app build failed"
    exit 1
fi

echo "Build test completed successfully!"
