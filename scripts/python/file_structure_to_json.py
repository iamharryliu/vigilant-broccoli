import os
import json
import sys


def folder_to_json(folder_path, root_path):
    result = {
        "name": os.path.basename(folder_path),
        "type": "folder",
        "filepath": os.path.relpath(folder_path, root_path),
        "children": [],
    }

    for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)

        if os.path.isdir(item_path):
            result["children"].append(folder_to_json(item_path, root_path))
        else:
            result["children"].append(
                {
                    "name": item,
                    "type": "file",
                    "filepath": os.path.relpath(item_path, root_path),
                }
            )

    return result


def save_json(data, output_file):
    with open(output_file, "w") as json_file:
        json.dump(data, json_file, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <folder_path> <output_file>")
        sys.exit(1)

    folder_path = sys.argv[1]
    output_file = sys.argv[2]

    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        data = folder_to_json(folder_path, folder_path)
        save_json(data, output_file)
        print(f"Folder structure has been converted to {output_file}")
    else:
        print("Invalid folder path. Please provide a valid folder path.")
