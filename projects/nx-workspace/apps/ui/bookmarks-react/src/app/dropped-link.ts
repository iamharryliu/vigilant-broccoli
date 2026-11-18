const HTTP_PROTOCOLS = ['http:', 'https:'];

const toUrl = (text: string) => {
  try {
    const url = new URL(text.trim());
    return HTTP_PROTOCOLS.includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
};

export function readDroppedLink(data: DataTransfer) {
  // text/uri-list may hold several lines and "#" comments; the first URL wins.
  const candidates = [
    ...data.getData('text/uri-list').split(/\r?\n/),
    data.getData('text/plain'),
  ];
  for (const candidate of candidates) {
    const url = toUrl(candidate);
    if (!url) continue;
    return { label: url.hostname, target: url.href };
  }
  return null;
}
