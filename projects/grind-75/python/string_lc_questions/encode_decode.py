class Solution:
    @classmethod
    def encode(self, strs):
        result = ""

        for string in strs:
            result += str(len(string)) + "#" + string
        return result

    @classmethod
    def decode(self, str):
        result, i = [], 0

        print(str)
        while i < len(str):
            j = i
            while str[j] != "#":
                j += 1
            length = int(str[i:j])
            result.append(str[j + 1 : j + 1 + length])
            i = j + 1 + length
        return result


encode = Solution.encode(["lint", "code", "love", "you"])
decode = Solution.decode(encode)
print(decode)
