extends Control

const GIFT_CARD_URL = "https://example.com/gift-card"
const TOTAL_HEARTS = 14

@onready var url_label = $VBoxContainer/URLLabel
@onready var background_url = $BackgroundURL

func _ready():
	url_label.text = GIFT_CARD_URL
	background_url.text = GIFT_CARD_URL

	var hearts = GameState.hearts_collected
	var reveal_amount = float(hearts) / float(TOTAL_HEARTS)

	background_url.modulate.a = reveal_amount

func _on_play_again_button_pressed():
	get_tree().change_scene_to_file("res://scenes/Game.tscn")

func _on_main_menu_button_pressed():
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func _on_copy_button_pressed():
	DisplayServer.clipboard_set(GIFT_CARD_URL)
