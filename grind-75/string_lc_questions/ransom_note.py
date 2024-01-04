class Solution:
    @classmethod
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        for c in set(ransomNote):
            if ransomNote.count(c) > magazine.count(c):
                return False
        return True


print(Solution.canConstruct(ransomNote="a", magazine="b") == False)
print(Solution.canConstruct(ransomNote="aa", magazine="ab") == False)
print(Solution.canConstruct(ransomNote="aa", magazine="aab") == True)
