extends Area2D

signal collected

@onready var sound = $AudioStreamPlayer2D
@onready var sprite = $Sprite2D

var collected_flag = false

func _ready():
	body_entered.connect(_on_body_entered)

func _on_body_entered(body):
	if body.name == "Player" and not collected_flag:
		collected_flag = true
		collected.emit()
		sound.play()
		animate_collection()
		await get_tree().create_timer(0.5).timeout
		queue_free()

func animate_collection():
	var tween = create_tween()
	tween.set_parallel(true)
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_OUT)

	tween.tween_property(sprite, "scale", Vector2(0.3, 0.3), 0.4)
	tween.tween_property(sprite, "modulate", Color.TRANSPARENT, 0.4)
	tween.tween_property(self, "position", position + Vector2(0, -30), 0.4)
