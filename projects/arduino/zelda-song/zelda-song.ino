// Song of Storms on an Arduino Uno. Wire a passive buzzer between D8 (+) and GND;
// an active buzzer only beeps one pitch and cannot play the melody.
const int SPEAKER_PIN = 8;

const int N_D4 = 294, N_E4 = 330, N_F4 = 349, N_G4 = 392, N_A4 = 440;
const int N_C5 = 523, N_D5 = 587, N_E5 = 659, N_F5 = 698;
const int REST = 0;

// {note, duration in beats}
const int melody[][2] = {
  {N_D4, 1}, {N_F4, 1}, {N_D5, 4},
  {N_D4, 1}, {N_F4, 1}, {N_D5, 4},
  {N_E5, 3}, {N_F5, 1}, {N_E5, 1}, {N_F5, 1}, {N_E5, 1}, {N_C5, 1}, {N_A4, 4},
  {N_A4, 2}, {N_D4, 2}, {N_F4, 1}, {N_G4, 1}, {N_A4, 6},
  {N_A4, 2}, {N_D4, 2}, {N_F4, 1}, {N_G4, 1}, {N_E4, 6},
  {REST, 4},
};

const int BEAT_MS = 150;

void setup() {
  for (const auto &n : melody) {
    int ms = n[1] * BEAT_MS;
    if (n[0] == REST) noTone(SPEAKER_PIN);
    else tone(SPEAKER_PIN, n[0], ms * 0.9);
    delay(ms);
  }
  noTone(SPEAKER_PIN);
}

void loop() {}
