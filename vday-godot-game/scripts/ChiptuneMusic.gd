extends Node

const SAMPLE_RATE := 44100.0
const BPM := 132.0
const BEAT_SECONDS := 60.0 / BPM

var _stream_player: AudioStreamPlayer
var _playback: AudioStreamGeneratorPlayback
var _phase_lead := 0.0
var _phase_bass := 0.0
var _current_frequency := 440.0
var _current_bass_frequency := 220.0
var _note_time_left := 0.0
var _sequence_index := 0

var _melody := [
	{"note": "E5", "beats": 0.5}, {"note": "G5", "beats": 0.5}, {"note": "A5", "beats": 1.0},
	{"note": "G5", "beats": 0.5}, {"note": "E5", "beats": 0.5}, {"note": "C5", "beats": 1.0},
	{"note": "D5", "beats": 0.5}, {"note": "E5", "beats": 0.5}, {"note": "G5", "beats": 1.0},
	{"note": "E5", "beats": 0.5}, {"note": "D5", "beats": 0.5}, {"note": "C5", "beats": 1.0},
	{"note": "A4", "beats": 0.5}, {"note": "C5", "beats": 0.5}, {"note": "E5", "beats": 1.0},
	{"note": "G5", "beats": 0.5}, {"note": "E5", "beats": 0.5}, {"note": "D5", "beats": 1.0},
	{"note": "C5", "beats": 0.5}, {"note": "D5", "beats": 0.5}, {"note": "E5", "beats": 1.0},
	{"note": "G5", "beats": 0.5}, {"note": "A5", "beats": 0.5}, {"note": "C6", "beats": 1.0}
]

var _note_frequencies := {
	"C5": 523.25,
	"D5": 587.33,
	"E5": 659.25,
	"G5": 783.99,
	"A5": 880.00,
	"A4": 440.00,
	"C6": 1046.50
}

func _ready() -> void:
	_stream_player = AudioStreamPlayer.new()
	_stream_player.volume_db = -13.0
	add_child(_stream_player)

	var generator := AudioStreamGenerator.new()
	generator.mix_rate = SAMPLE_RATE
	generator.buffer_length = 0.2
	_stream_player.stream = generator
	_stream_player.play()

	_playback = _stream_player.get_stream_playback() as AudioStreamGeneratorPlayback
	_advance_note()

func _process(delta: float) -> void:
	if _playback == null:
		return

	_note_time_left -= delta
	while _note_time_left <= 0.0:
		_advance_note()

	var frames_available := _playback.get_frames_available()
	for i in frames_available:
		var lead_sample := _square_sample(_phase_lead)
		var bass_sample := _square_sample(_phase_bass)
		var sample := lead_sample * 0.18 + bass_sample * 0.08
		_playback.push_frame(Vector2(sample, sample))

		_phase_lead += _current_frequency / SAMPLE_RATE
		_phase_bass += _current_bass_frequency / SAMPLE_RATE
		_phase_lead = fmod(_phase_lead, 1.0)
		_phase_bass = fmod(_phase_bass, 1.0)

func _advance_note() -> void:
	var note_data = _melody[_sequence_index]
	var note_name: String = note_data["note"]
	_current_frequency = _note_frequencies.get(note_name, 440.0)
	_current_bass_frequency = _current_frequency / 2.0
	_note_time_left += BEAT_SECONDS * float(note_data["beats"])
	_sequence_index = (_sequence_index + 1) % _melody.size()

func _square_sample(phase: float) -> float:
	if phase < 0.5:
		return 1.0
	return -1.0
