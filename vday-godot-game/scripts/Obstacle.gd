extends Area2D

const SPEED = 100.0
const PATROL_DISTANCE = 200.0
const SHIBA_SPRITE = preload("res://sprites/obstacle_shiba.svg")
const BOY_SPRITE = preload("res://sprites/obstacle_boy.svg")
const DOG_GROWL = preload("res://audio/dog_growl.wav")
const MAN_GROAN = preload("res://audio/man_groan.wav")
const WOMAN_GROAN = preload("res://audio/woman_groan.wav")

var start_position = Vector2.ZERO
var direction = Vector2.RIGHT
var distance_traveled = 0.0
var is_shiba = false
var health = 3
var death_sound = null

@onready var sprite = $Sprite2D
@onready var sound = $AudioStreamPlayer2D

func _ready():
	start_position = position
	direction = Vector2(randf_range(-1, 1), randf_range(-1, 1)).normalized()
	if direction == Vector2.ZERO:
		direction = Vector2.RIGHT

	if randf() > 0.5:
		sprite.texture = SHIBA_SPRITE
		is_shiba = true
		death_sound = DOG_GROWL
	else:
		sprite.texture = BOY_SPRITE
		death_sound = MAN_GROAN

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
		body.play_death_sound()
		if is_shiba and sound:
			sound.play()
		get_tree().call_deferred("reload_current_scene")

func take_damage():
	health -= 1
	if health <= 0:
		animate_destruction()
	else:
		animate_hit()

func animate_hit():
	var tween = create_tween()
	tween.set_trans(Tween.TRANS_BOUNCE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(sprite, "modulate", Color.RED, 0.1)
	tween.tween_property(sprite, "modulate", Color.WHITE, 0.1)

func animate_destruction():
	if death_sound and sound:
		sound.stream = death_sound
		sound.play()

	var tween = create_tween()
	tween.set_parallel(true)
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_IN)

	tween.tween_property(sprite, "scale", Vector2(0, 0), 0.3)
	tween.tween_property(sprite, "modulate", Color.TRANSPARENT, 0.3)
	tween.tween_property(self, "position", position + Vector2(0, -40), 0.3)

	tween.tween_callback(queue_free)
