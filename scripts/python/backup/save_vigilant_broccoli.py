import os
import requests


URL = "https://github.com/iamharryliu/vigilant-broccoli/archive/refs/heads/main.zip"
DIRECTORY = os.path.expanduser("~/My Drive/Career/")
FILENAME = "vigilant-broccoli.zip"
FILEPATH = os.path.join(DIRECTORY, FILENAME)


def main() -> None:
    try:
        download_file(URL, FILEPATH)
    except (requests.exceptions.RequestException, OSError) as e:
        print(f"Failed to download or save the file: {e}")


def download_file(url: str, filepath: str) -> None:
    response = requests.get(url)
    with open(filepath, "wb") as f:
        f.write(response.content)


if __name__ == "__main__":
    main()
