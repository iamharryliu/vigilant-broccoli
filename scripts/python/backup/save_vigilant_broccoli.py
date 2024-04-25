import requests
import os

FILENAME = "vigilant-broccoli.zip"


def download_file(url, directory):
    print("Backup started.")
    response = requests.get(url)
    if response.status_code == 200:
        file_path = os.path.join(directory, FILENAME)
        with open(file_path, "wb") as f:
            f.write(response.content)
        print(f"Backup successfully downloaded to {file_path}")
    else:
        print("Failed to backup.")


url = "https://github.com/iamharryliu/vigilant-broccoli/archive/refs/heads/main.zip"
directory = "~/My Drive/Career/"
directory = os.path.expanduser(directory)

if os.path.exists(FILENAME):
    # Remove the existing file
    os.remove(FILENAME)
    print(f"Existing file removed: {FILENAME}")
download_file(url, directory)
