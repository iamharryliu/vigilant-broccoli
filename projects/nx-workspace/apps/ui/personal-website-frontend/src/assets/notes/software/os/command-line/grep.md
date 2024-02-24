# Grep

There are 2 versions of grep, GNU (Windows and Linux) and BSD (MacOS)

```
grep -V
```

```
grep word file
grep -w word file #whole word
grep -i word  file #case insensitive
grep -n word file #number
grep -B 4 word file #4 lines before
grep -A 4 word file #4 lines after
grep -C 4 word file #4 lines before and after
grep word ./*.txt #grep all text files in directory
grep -r word ./*.txt #grep all text files in directory recursively
grep -l word file #filenames that contain word
grep -c word file #filenames that contain word + count


history | grep "git commit"
text | grep word | grep word2
grep "...-...-...." file #grep for phone numbers
grep -P "\d{3}-\d{3}-\d{4}" ./* #grep for phone numbers more specifically using perl

fgrep #fixed string search
```
