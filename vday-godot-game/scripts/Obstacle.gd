extends Area2D

const SPEED = 100.0
const PATROL_DISTANCE = 200.0
const SHIBA_SPRITE = preload("res://sprites/obstacle_shiba.svg")
const BOY_SPRITE = preload("res://sprites/obstacle_boy.svg")

var start_position = Vector2.ZERO
var direction = Vector2.RIGHT
var distance_traveled = 0.0

@onready var sprite = $Sprite2D

func _ready():
	start_position = position
	direction = Vector2(randf_range(-1, 1), randf_range(-1, 1)).normalized()
	if direction == Vector2.ZERO:
		direction = Vector2.RIGHT

	if randf() > 0.5:
		sprite.texture = SHIBA_SPRITE
	else:
		sprite.texture = BOY_SPRITE

	body_entered.connect(_on_body_entered)

func _process(delta):
	var movement = direction * SPEED * delta
	position += movement
	distance_traveled += movement.length()

	if distance_traveled >= PATROL_DISTANCE:
		direction = -direction
		distance_traveled = 0.0

func _on_body_entered(body):
	if body.name == "Player":
		get_tree().call_deferred("reload_current_scene")
