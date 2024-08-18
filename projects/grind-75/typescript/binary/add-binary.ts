export default function addBinary(a: string, b: string): string {
  let res = '';
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;

  while (i >= 0 || j >= 0 || carry > 0) {
    let n1 = i >= 0 ? Number(a[i]) : 0;
    let n2 = j >= 0 ? Number(b[j]) : 0;

    let total = n1 + n2 + carry;
    carry = Math.floor(total / 2);
    res = (total % 2) + res;

    // Move to the next digits
    i--;
    j--;
  }

  return res;
}
