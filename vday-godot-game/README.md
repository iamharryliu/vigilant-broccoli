# Valentine's Day Adventure Game

A cute 2D adventure game where you collect hearts and unlock a special Valentine's Day message!

## How to Play

1. Open Godot Engine
2. Click "Import" and select the `project.godot` file from this directory
3. Click "Import & Edit"
4. Press F5 or click the Play button to start the game

## Game Instructions

- **Objective**: Collect all 14 hearts before time runs out
- **Controls**:
  - WASD or Arrow Keys to move
  - Avoid moving obstacles (black shiba dog and boy with black hair - they reset the game)
- **Timer**: You have 3 minutes to collect all hearts
- **Victory**: Collect all 14 hearts to unlock the secret message!
- **Special Feature**: The gift card URL appears in the background and becomes clearer as you collect more hearts!

## Setting Up the Map

The game currently has a simple green grass background. To add decorative obstacles (trees, rocks, water borders):

**Option 1**: Paint tiles in Godot Editor (see TILEMAP_INSTRUCTIONS.md)
**Option 2**: Play as-is with just the green background (game is fully playable!)

The moving obstacles (shiba & boy) and hearts work regardless of the tile decorations.

## Customization

To change the gift card URL:

1. Open `scripts/Victory.gd`
2. Change the `GIFT_CARD_URL` constant to your desired URL
3. Save and run the game

## Project Structure

- `scenes/` - Game scenes (MainMenu, Game, Victory, Player, Heart, Obstacle)
- `scripts/` - GDScript files for game logic
- `sprites/` - Pixel art SVG sprites
- `tilemaps/` - Tilemap resources

## Requirements

- Godot Engine 4.2 or later

Enjoy the game!
