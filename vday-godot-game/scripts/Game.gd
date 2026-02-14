extends Node2D

const HEART_SCENE = preload("res://scenes/Heart.tscn")
const OBSTACLE_SCENE = preload("res://scenes/Obstacle.tscn")
const TOTAL_HEARTS = 14
const GAME_TIME = 180.0

var hearts_collected = 0
var time_remaining = GAME_TIME
var game_over = false

@onready var player = $Player
@onready var hearts_label = $UI/HeartsLabel
@onready var timer_label = $UI/TimerLabel

var heart_positions = []

func _ready():
	hearts_collected = 0
	GameState.hearts_collected = 0
	setup_heart_positions()
	spawn_hearts()
	spawn_obstacles()
	update_ui()

func setup_heart_positions():
	heart_positions = [
		Vector2(150, 120), Vector2(300, 140), Vector2(450, 120),
		Vector2(600, 140), Vector2(750, 120), Vector2(900, 140),
		Vector2(1050, 120), Vector2(200, 280), Vector2(400, 300),
		Vector2(650, 280), Vector2(850, 300), Vector2(1100, 280),
		Vector2(350, 480), Vector2(750, 460)
	]

func spawn_hearts():
	for pos in heart_positions:
		var heart = HEART_SCENE.instantiate()
		heart.position = pos
		heart.collected.connect(_on_heart_collected)
		add_child(heart)

func spawn_obstacles():
	var obstacle_positions = [
		Vector2(250, 200), Vector2(550, 220),
		Vector2(800, 200), Vector2(1000, 220),
		Vector2(350, 380), Vector2(650, 400),
		Vector2(900, 380)
	]

	for pos in obstacle_positions:
		var obstacle = OBSTACLE_SCENE.instantiate()
		obstacle.position = pos
		add_child(obstacle)

func _process(delta):
	if game_over:
		return

	time_remaining -= delta
	update_ui()

	if time_remaining <= 0:
		time_remaining = 0
		game_over = true
		game_over_timeout()

func _on_heart_collected():
	hearts_collected += 1
	GameState.hearts_collected = hearts_collected
	update_ui()

	if hearts_collected >= TOTAL_HEARTS:
		game_over = true
		victory()

func update_ui():
	hearts_label.text = "Hearts: %d/%d" % [hearts_collected, TOTAL_HEARTS]
	var minutes = int(time_remaining) / 60
	var seconds = int(time_remaining) % 60
	timer_label.text = "Time: %02d:%02d" % [minutes, seconds]

func victory():
	GameState.hearts_collected = hearts_collected
	get_tree().change_scene_to_file("res://scenes/Victory.tscn")

func game_over_timeout():
	get_tree().reload_current_scene()
