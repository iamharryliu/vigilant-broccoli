extends CharacterBody2D

const SPEED = 150.0

@onready var sprite = $Sprite2D

var facing_direction = Vector2.DOWN

func _physics_process(delta):
	var input_direction = Input.get_vector("move_left", "move_right", "move_up", "move_down")

	if input_direction != Vector2.ZERO:
		facing_direction = input_direction.normalized()
		velocity = input_direction * SPEED
		update_sprite_direction()
	else:
		velocity = Vector2.ZERO

	move_and_slide()

func update_sprite_direction():
	if abs(facing_direction.x) > abs(facing_direction.y):
		if facing_direction.x > 0:
			sprite.flip_h = false
		else:
			sprite.flip_h = true
	else:
		sprite.flip_h = false
