# Find

```
find . #all files in directory
find . -type d #only directories
find . -type f #only files
find . -type f -name "test.txt" #find specific file
find . -type f -iname "test.txt" #find specific file case insensitive
find . -type f  -name "*.py" #find python files
find . -type f -mmin -10 #find files modified less than 10 minutes ago
find . -type f -mmin +10 #find files modified more than 10 minutes ago
find . -type f -mmin +10 -mmin -15 #more than 10, less than 15 mins ago
find . -type f -mtime -10
find . -type f -mtime +10
find . -type f -mtime +10 -mtime -15
amin atime #access
cmin ctime #change
Modify vs change: modify is the contents of a file while change is the file's inode being changed, ie permissions, ownership, file name, number of hard links.
find . -size +5k #more than 5kB
find . -size +5M #more than 5MB
find . -size +5G #morethan 5GB
find . -empty #find empty files
find . -perm 777 #find all files with permission 777

find . -exec chown user:group {} +
find . -type d -exec chmod 775 {} +
find . -type f -exec chmod 664 {} +

find . -type f -name "*.jpg" -maxdepth 1 -exec rm {} +

find . -type f -mtime +14 -exec rm {} +
find .  -printf  '.'  | wc -c # count find results


# Count number of files.
find DIR_NAME -type f | wc -l
```

# find - Used to find files and directories in a specified search

find [starting_directory] [options] [expression]
