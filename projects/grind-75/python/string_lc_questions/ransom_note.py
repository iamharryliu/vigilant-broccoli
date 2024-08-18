class Solution:
    @classmethod
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        ransom_count = {}
        magazine_count = {}
        for char in magazine:
            magazine_count[char] = magazine_count.get(char, 0) + 1
        for char in ransomNote:
            ransom_count[char] = ransom_count.get(char, 0) + 1
        for char, count in ransom_count.items():
            if magazine_count.get(char, 0) < count:
                return False
        return True
