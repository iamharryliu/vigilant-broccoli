# Customization Guide

## Changing the Gift Card URL

To update the secret message URL that appears when all hearts are collected:

1. Open `scripts/Victory.gd`
2. Find this line:
   ```gdscript
   const GIFT_CARD_URL = "https://example.com/gift-card"
   ```
3. Replace the URL with your actual gift card URL
4. Save the file

## Adjusting Game Difficulty

### Timer Duration

In `scripts/Game.gd`, change:

```gdscript
const GAME_TIME = 180.0
```

- Default is 180 seconds (3 minutes)
- Increase for easier gameplay
- Decrease for more challenge

### Number of Hearts

In `scripts/Game.gd`, change:

```gdscript
const TOTAL_HEARTS = 14
```

- Default is 14 hearts
- Note: You'll also need to adjust the `heart_positions` array to match

### Player Speed

In `scripts/Player.gd`, change:

```gdscript
const SPEED = 150.0
```

- Default is 150 pixels/second
- Increase for faster movement
- Decrease for more precise control

### Obstacle Speed

In `scripts/Obstacle.gd`, change:

```gdscript
const SPEED = 100.0
```

- Default is 100 pixels/second
- Adjust for difficulty

## Customizing the Victory Message

In `scenes/Victory.tscn` or by editing in Godot:

- Update the MessageLabel text
- Change colors and fonts
- Add animations or particle effects

## Maze Layout

The maze is defined in `scenes/Game.tscn` using TileMap data. To customize:

1. Open the Game scene in Godot Editor
2. Select the TileMap node
3. Use the TileMap editor to modify walls and paths
4. Update heart positions in `scripts/Game.gd` (heart_positions array)

## Visual Theme

All sprites are SVG files in the `sprites/` directory:

- `player_girl.svg` - Main character (blonde girl in pink dress)
- `heart.svg` - Collectible hearts
- `wall.svg` - Maze walls
- `obstacle_shiba.svg` - Shiba dog obstacle
- `obstacle_boy.svg` - Boy with black hair obstacle
- `floor.svg` - Background tiles

The game randomly selects between the shiba dog and boy sprites for each obstacle when spawned.

You can edit these in any vector graphics editor (Inkscape, Adobe Illustrator, etc.) or replace with your own pixel art.

## Progressive URL Reveal

The victory screen displays the gift card URL in the background with a transparency effect. The URL becomes more visible based on how many hearts were collected:

- 0 hearts = completely invisible
- 14 hearts = fully visible

This is controlled in `scripts/Victory.gd` with the formula:

```gdscript
var reveal_amount = float(hearts) / float(TOTAL_HEARTS)
background_url.modulate.a = reveal_amount
```

You can adjust this formula to change how the reveal works.
