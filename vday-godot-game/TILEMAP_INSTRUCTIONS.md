# How to Paint the Game Map in Godot Editor

The tilemap is set up but needs to be painted in Godot. Here's how:

## Step 1: Open the Game Scene

1. Open Godot
2. Open `scenes/Game.tscn`
3. Select the `TileMap` node in the scene tree

## Step 2: Add Layer 1 for Obstacles

1. In the TileMap inspector (right panel), find "Layers"
2. Click the + button to add a second layer
3. Name it "Obstacles"

## Step 3: Paint Layer 0 (Ground - Grass)

1. Select Layer 0 in the TileMap layers list
2. In the bottom panel, you'll see the TileMap editor
3. Click on the **Grass tile** (green, source ID 1)
4. Use the paint bucket or paint tool to fill the entire screen with grass
   - The game window is 1280x720, which is 40x22.5 tiles (32px each)
   - Paint from (0,0) to (39, 22)

## Step 4: Paint Layer 1 (Obstacles)

1. Select Layer 1 "Obstacles"
2. Paint the following:

### Water Borders (Blue tiles, source ID 4)

- Top row: Paintall tiles from (0,0) to (39,0)
- Bottom row: Paint all tiles from (0,22) to (39,22)
- Left column: Paint all tiles from (0,0) to (0,22)
- Right column: Paint all tiles from (39,0) to (39,22)

### Trees (Green tree tiles, source ID 2)

Scatter 8-12 trees around the map avoiding borders. Example positions:

- (5, 4), (5, 5)
- (12, 4), (12, 5)
- (20, 6), (20, 7)
- (28, 4), (28, 5)
- (35, 5), (35, 6)

### Rocks (Gray rock tiles, source ID 3)

Scatter 8-12 rocks around the map. Example positions:

- (8, 8)
- (16, 10)
- (24, 8)
- (32, 10)
- (6, 15), (14, 16), (22, 15), (30, 16)

## Tips

- Make sure obstacles create paths, not walls
- Leave plenty of open space for the player to move
- Hearts will spawn at the positions in `scripts/Game.gd`
- Use Ctrl+Z to undo mistakes
- Save often (Ctrl+S)

## Alternative: Use StaticBody2D Nodes

If TileMap painting doesn't work well, you can:

1. Delete the TileMap node
2. Add individual Sprite2D nodes with collision shapes
3. This gives more precise control but is more manual
