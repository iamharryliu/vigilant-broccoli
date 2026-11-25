# Arduino on macOS

Setup for the Arduino Uno sketches in this folder, using `arduino-cli`.

## Install

```sh
brew install arduino-cli
arduino-cli core update-index
arduino-cli core install arduino:avr
```

## Wiring

| Buzzer pin | Arduino pin |
| --- | --- |
| − (shorter leg) | GND |
| + (longer leg, or marked) | D8 |

A passive buzzer needs no resistor. An active buzzer has a built-in oscillator and only plays one pitch, so it cannot play melodies.

## Compile and upload

Compile and flash onto a connected Uno in one step, auto-detecting the port:

```sh
arduino-cli compile --upload --fqbn arduino:avr:uno -p "$(ls /dev/cu.usbmodem* | head -1)" projects/arduino/zelda-song
```

Or step by step:

```sh
arduino-cli board list
arduino-cli compile --fqbn arduino:avr:uno projects/arduino/zelda-song
arduino-cli upload --fqbn arduino:avr:uno -p /dev/cu.usbmodemXXXX projects/arduino/zelda-song
```

- Replace `/dev/cu.usbmodemXXXX` with the port from `ls /dev/cu.usb*`.
- `board list` can print `No boards found` for a working Uno; pass `--fqbn` and `-p` explicitly.
- The sketch plays once on power-up. Press the board's reset button to replay it.
- Use `arduino:avr:nano` for a Nano.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `A4` or `A5` redefinition errors | Prefix note constants (`N_A4`); `A0`–`A5` are analog pin macros. |
| `programmer is not responding` | Unplug anything on pins 0 and 1, replug USB directly into the Mac (not a hub), press reset, retry. |
| No port listed | Use a data USB cable; clones with a CH340 chip need its driver. |
| Nano upload fails | Select the old bootloader: `arduino:avr:nano:cpu=atmega328old`. |
| Silent buzzer | Check polarity and that the buzzer is passive. |
