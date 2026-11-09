# File Formats

## Table of Contents

- [Images](#images)
- [Audio](#audio)
- [Video](#video)
- [Documents](#documents)
- [Archives](#archives)

## Images

| Format | Compression | Transparency | Animation | Best for |
| :-- | :-- | :-- | :-- | :-- |
| AVIF | Lossy or lossless, best ratios | Yes | Yes | Modern web photos where size matters most; slow to encode. |
| GIF | Lossless, 256 colours | 1-bit only | Yes | Short, simple loops; large and low quality, so prefer MP4 or WebP. |
| HEIC | Lossy, about half the size of JPG | Yes | Yes | Phone camera photos (iOS default); poor browser support. |
| JPG | Lossy | No | No | Photos and gradients where small size beats perfect fidelity. |
| PNG | Lossless | Full alpha | No (APNG is an extension) | Screenshots, logos, UI and text-heavy graphics. |
| SVG | Vector (XML text) | Yes | Yes (CSS or SMIL) | Icons, logos and diagrams that must scale cleanly. |
| WebP | Lossy or lossless | Yes | Yes | General web replacement for JPG, PNG and GIF. |

## Audio

| Format | Compression | Quality | Best for |
| :-- | :-- | :-- | :-- |
| AAC | Lossy, better than MP3 at the same bitrate | Good | Streaming, Apple devices and video soundtracks. |
| FLAC | Lossless, about 50-60% of WAV size | Original | Archiving and listening without quality loss. |
| MP3 | Lossy | Good at 192 kbps and above | Universal compatibility; the default for portable music and podcasts. |
| Opus | Lossy, best at low bitrates | Good | Voice calls, WebRTC and low-bandwidth streaming. |
| WAV | None (uncompressed PCM) | Original | Recording and editing; very large files. |

## Video

| Format | Kind | Typical codecs | Best for |
| :-- | :-- | :-- | :-- |
| AVI | Container | Many legacy codecs | Legacy files; no modern features and poor streaming support. |
| MKV | Container | Any, with multiple audio and subtitle tracks | Archiving and local media libraries. |
| MOV | Container | H.264, HEVC, ProRes | Apple capture and editing workflows. |
| MP4 | Container | H.264, HEVC, AV1 with AAC audio | Universal playback and web streaming. |
| WebM | Container | VP9 or AV1 with Opus audio | Open web video. |

## Documents

| Format | Editable | Layout | Best for |
| :-- | :-- | :-- | :-- |
| CSV | Yes (plain text) | None, flat rows only | Simple tabular data exchange; no types or multiple sheets. |
| DOCX | Yes | Reflows by application | Word-processing documents under collaborative editing. |
| JSON | Yes (plain text) | None, nested data | APIs and configuration. |
| Markdown | Yes (plain text) | Rendered by the viewer | Notes and documentation under version control. |
| PDF | Hard | Fixed, identical everywhere | Sharing, printing and signing finished documents. |
| XLSX | Yes | Cells, formulas and multiple sheets | Spreadsheets with calculations. |

## Archives

| Format | Compression | Best for |
| :-- | :-- | :-- |
| 7z | Strongest, slow | Maximum compression; needs extra software on some systems. |
| gzip (`.gz`) | Fast, moderate; one file only | Compressing a single stream, often paired with tar as `.tar.gz`. |
| tar | None; bundles files only | Combining many files into one while preserving Unix permissions. |
| zip | Moderate, per-file | Universal sharing with random access to individual entries. |
| zstd (`.zst`) | Fast, ratio near gzip or better | Modern replacement for gzip in build, package and backup pipelines. |
