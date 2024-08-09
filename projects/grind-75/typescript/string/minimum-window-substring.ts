export default function minWindow(s: string, t: string): string {
  const smap: { [key: string]: number } = {};
  const tmap: { [key: string]: number } = {};

  for (let c of t) {
    tmap[c] = (tmap[c] || 0) + 1;
  }

  let have = 0;
  const need = Object.keys(tmap).length;

  let res: string | null = null;

  let l = 0;
  for (let r = 0; r < s.length; r++) {
    let c = s[r];
    smap[c] = (smap[c] || 0) + 1;
    if (c in tmap && smap[c] === tmap[c]) {
      have += 1;
    }
    while (have === need) {
      if (!res || r - l + 1 < res.length) {
        res = s.slice(l, r + 1);
      }
      smap[s[l]] -= 1;
      if (s[l] in tmap && smap[s[l]] < tmap[s[l]]) {
        have -= 1;
      }
      l += 1;
    }
  }
  return res ? res : '';
}
