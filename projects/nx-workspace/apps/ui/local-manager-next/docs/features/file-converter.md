# File Converter

- The Feature Sandbox's File Converter uploads one file to `POST /api/file-convert` (`file`, `target` form fields) and offers the converted file as a download.
- The route shells out to host CLI tools picked by the input extension: `sips` for images (including HEIC), `ffmpeg` for audio and video, and `textutil` for documents. `sips` and `textutil` ship with macOS; `ffmpeg` must be on the PM2 process's `PATH` (Homebrew).
- Supported inputs and targets live in `FILE_CONVERSION_CATEGORIES` (`src/app/constants/file-conversion.ts`), shared by the route and the UI. Each request runs in its own temp directory, which is removed afterwards.
