extends CharacterBody2D

const SPEED = 150.0
const PROJECTILE_SCENE = preload("res://scenes/Projectile.tscn")
const MAX_MANA = 3
const MANA_RECHARGE_DELAY = 3.0
const WOMAN_GROAN = preload("res://audio/woman_groan.wav")

@onready var sprite = $Sprite2D
@onready var sound = $AudioStreamPlayer2D
@onready var shoot_sound = $ShootSound

var facing_direction = Vector2.DOWN
var mana = MAX_MANA
var last_mana_use_time = 0.0
var is_moving = false
var walk_time = 0.0
var walk_speed = 6.0

func _physics_process(delta):
	var input_direction = Input.get_vector("move_left", "move_right", "move_up", "move_down")

	if input_direction != Vector2.ZERO:
		facing_direction = input_direction.normalized()
		velocity = input_direction * SPEED
		update_sprite_direction()
		is_moving = true
		walk_time += delta * walk_speed
		if sprite.animation != "walk":
			sprite.play("walk")
	else:
		velocity = Vector2.ZERO
		is_moving = false
		walk_time = 0.0
		sprite.play("idle")

	move_and_slide()

	if Input.is_action_just_pressed("ui_select"):
		shoot()

	recharge_mana(delta)

func update_sprite_direction():
	if abs(facing_direction.x) > abs(facing_direction.y):
		if facing_direction.x > 0:
			sprite.flip_h = false
		else:
			sprite.flip_h = true
	else:
		sprite.flip_h = false

func shoot():
	if mana > 0:
		mana -= 1
		last_mana_use_time = 0.0

		shoot_sound.play()
		animate_shoot()

		var projectile = PROJECTILE_SCENE.instantiate()
		projectile.position = global_position + facing_direction * 15
		projectile.set_direction(facing_direction)
		get_parent().add_child(projectile)

func animate_shoot():
	var tween = create_tween()
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_OUT)

	var original_scale = sprite.scale
	tween.tween_property(sprite, "scale", original_scale * 1.2, 0.1)
	tween.tween_property(sprite, "scale", original_scale, 0.1)

func recharge_mana(delta):
	if mana < MAX_MANA:
		last_mana_use_time += delta
		if last_mana_use_time >= MANA_RECHARGE_DELAY:
			mana = MAX_MANA
			last_mana_use_time = 0.0

func get_mana_percentage() -> float:
	return float(mana) / MAX_MANA

func play_death_sound():
	if sound:
		sound.stream = WOMAN_GROAN
		sound.play()
