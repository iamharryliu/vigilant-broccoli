function zipDirs() {
  if [[ $# -eq 0 ]]; then
    echo "Error: No directory specified."
    return 1
  fi

  for folder in "$@"; do
    if [[ -d $folder ]]; then
      zip -r "${folder}.zip" "$folder"
      echo "Zipped folder $folder into ${folder}.zip"
    else
      echo "Error: $folder is not a valid directory"
    fi
  done
}
