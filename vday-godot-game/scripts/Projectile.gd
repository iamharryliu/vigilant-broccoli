extends Area2D

const SPEED = 300.0
const RANGE = 200.0

var direction = Vector2.RIGHT
var distance_traveled = 0.0
var is_active = true

@onready var sprite = $Sprite2D

func _ready():
	area_entered.connect(_on_area_entered)

func _process(delta):
	if not is_active:
		return

	var movement = direction * SPEED * delta
	position += movement
	distance_traveled += movement.length()

	if distance_traveled >= RANGE:
		queue_free()

func _on_area_entered(area):
	if is_active and area.name == "Obstacle":
		is_active = false
		area.take_damage()
		queue_free()

func set_direction(new_direction: Vector2):
	direction = new_direction.normalized()
	if sprite and direction.x != 0:
		sprite.flip_h = direction.x < 0
