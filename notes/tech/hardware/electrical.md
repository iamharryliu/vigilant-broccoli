# Electrical

## Table of Contents

- [Electrical Components](#electrical-components)
  - [Resistors](#resistors)
    - [Resistor Color Guide](#resistor-color-guide)
    - [Common Resistor Values](#common-resistor-values)
- [Arduino](#arduino)
  - [Install](#install)
  - [Buzzer Wiring](#buzzer-wiring)
  - [Compile and Upload](#compile-and-upload)
  - [Troubleshooting](#troubleshooting)
  - [Uno Pins](#uno-pins)

## Electrical Components

| Component | Internals | How to drive | Use | Hobby module |
| --- | --- | --- | --- | --- |
| Active Buzzer | Transducer plus built-in oscillator | Apply DC voltage (`digitalWrite` HIGH); it makes one fixed-pitch tone | Simple on/off beeps, no pitch control | Black cylinder with a sealed bottom |
| Jumper Wire | Insulated conductor with connector ends | Connects two points; no polarity, wire color is only a convention | Wires a breadboard to Arduino pins and parts | Dupont ends: male-male, male-female or female-female |
| Passive Buzzer | Transducer only, no oscillator | Needs a square wave (`tone(pin, frequency)`); the frequency sets the pitch | Variable pitch, so it can play melodies | Black cylinder with an exposed green circuit board |
| Resistor | Resistive element | In series with the load; no polarity | Limits current, e.g. for an LED | Small cylinder with color bands |

### Resistors

#### Resistor Color Guide

| Color | Digit | Multiplier | Tolerance |
| --- | --- | --- | --- |
| ⚫ Black | 0 | ×1 |  |
| 🟤 Brown | 1 | ×10 | ±1% |
| 🔴 Red | 2 | ×100 | ±2% |
| 🟠 Orange | 3 | ×1k |  |
| 🟡 Yellow | 4 | ×10k |  |
| 🟢 Green | 5 | ×100k | ±0.5% |
| 🔵 Blue | 6 | ×1M | ±0.25% |
| 🟣 Violet | 7 | ×10M | ±0.1% |
| 🩶 Grey | 8 | ×100M | ±0.05% |
| ⚪ White | 9 | ×1G |  |
| 🟨 Gold |  | ×0.1 | ±5% |
| 🔘 Silver |  | ×0.01 | ±10% |

- 4-band: digit, digit, multiplier, tolerance. 5-band: digit, digit, digit, multiplier, tolerance.
- The tolerance band (gold or silver) sits slightly apart from the others; read from the opposite end.

#### Common Resistor Values

| Value | Visual | Bands (4-band) |
| --- | --- | --- |
| 100 Ω | 🟤⚫🟤 | Brown, Black, Brown |
| 220 Ω | 🔴🔴🟤 | Red, Red, Brown |
| 330 Ω | 🟠🟠🟤 | Orange, Orange, Brown |
| 470 Ω | 🟡🟣🟤 | Yellow, Violet, Brown |
| 1 kΩ | 🟤⚫🔴 | Brown, Black, Red |
| 2.2 kΩ | 🔴🔴🔴 | Red, Red, Red |
| 4.7 kΩ | 🟡🟣🔴 | Yellow, Violet, Red |
| 10 kΩ | 🟤⚫🟠 | Brown, Black, Orange |
| 47 kΩ | 🟡🟣🟠 | Yellow, Violet, Orange |
| 100 kΩ | 🟤⚫🟡 | Brown, Black, Yellow |
| 1 MΩ | 🟤⚫🟢 | Brown, Black, Green |

- Add a gold band after these for ±5%.

## Arduino

Setup for Arduino Uno sketches using `arduino-cli` on macOS.

### Install

```sh
brew install arduino-cli
arduino-cli core update-index
arduino-cli core install arduino:avr
```

### Buzzer Wiring

| Buzzer pin | Arduino pin |
| --- | --- |
| − (shorter leg) | GND |
| + (longer leg, or marked) | D8 |

A passive buzzer needs no resistor. An active buzzer has a built-in oscillator and only plays one pitch, so it cannot play melodies.

### Compile and Upload

Compile and flash onto a connected Uno in one step, auto-detecting the port:

```sh
arduino-cli compile --upload --fqbn arduino:avr:uno -p /dev/cu.usbmodem* path/to/sketch
```

Or step by step:

```sh
arduino-cli board list
arduino-cli compile --fqbn arduino:avr:uno path/to/sketch
arduino-cli upload --fqbn arduino:avr:uno -p /dev/cu.usbmodemXXXX path/to/sketch
```

- Replace `/dev/cu.usbmodemXXXX` with the port from `ls /dev/cu.usb*`.
- `board list` can print `No boards found` for a working Uno; pass `--fqbn` and `-p` explicitly.
- A sketch that only runs in `setup()` plays once on power-up; press the board's reset button to run it again.
- Use `arduino:avr:nano` for a Nano.

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| `A4` or `A5` redefinition errors | Prefix note constants (`N_A4`); `A0`–`A5` are analog pin macros. |
| `programmer is not responding` | Unplug anything on pins 0 and 1, replug USB directly into the Mac (not a hub), press reset, retry. |
| No port listed | Use a data USB cable; clones with a CH340 chip need its driver. |
| Nano upload fails | Select the old bootloader: `arduino:avr:nano:cpu=atmega328old`. |
| Silent buzzer | Check polarity and that the buzzer is passive. |

### Uno Pins

| Pin | Type | Notes |
| --- | --- | --- |
| 5V | Power out | Regulated 5 V |
| 3.3V | Power out | Regulated 3.3 V, about 50 mA |
| GND | Ground | Several on the board; all connected |
| VIN | Power in/out | Raw supply voltage from the barrel jack |
| IOREF | Reference | Reports the board's logic voltage (5 V) |
| RESET | Control | Pull LOW to restart the board |
| A0-A5 | Analog in | 10-bit `analogRead` (0-1023); also usable as D14-D19 |
| A4 / A5 | I2C | SDA / SCL |
| D0 / D1 | Digital, serial | RX / TX; shared with USB, avoid while uploading |
| D2 | Digital | Interrupt 0 |
| D3 | Digital, PWM | Interrupt 1 |
| D4 | Digital |  |
| D5 | Digital, PWM |  |
| D6 | Digital, PWM |  |
| D7 | Digital |  |
| D8 | Digital |  |
| D9 | Digital, PWM |  |
| D10 | Digital, PWM | SPI SS |
| D11 | Digital, PWM | SPI MOSI |
| D12 | Digital | SPI MISO |
| D13 | Digital | SPI SCK; drives the on-board LED |

- Digital pins are 5 V logic; keep each pin to about 20 mA (40 mA absolute max), so use a resistor with LEDs.
- PWM pins are marked `~` on the board and output `analogWrite` values 0-255.
