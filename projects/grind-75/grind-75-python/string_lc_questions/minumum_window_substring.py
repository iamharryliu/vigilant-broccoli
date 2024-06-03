class Solution:
    @classmethod
    def minWindow(self, s: str, t: str) -> str:
        smap = {}
        tmap = {}
        for c in t:
            tmap[c] = tmap.get(c, 0) + 1

        have = 0
        need = len(tmap)

        res = None

        l = 0
        for r, c in enumerate(s):
            smap[c] = smap.get(c, 0) + 1
            if c in tmap and smap[c] == tmap[c]:
                have += 1
            while have == need:
                if not res or r - l + 1 < len(res):
                    res = s[l : r + 1]
                smap[s[l]] -= 1
                if s[l] in tmap and smap[s[l]] < tmap[s[l]]:
                    have -= 1
                l += 1
        return res if res else ""
