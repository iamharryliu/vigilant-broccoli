const MAX_STACK = 3;
const STACK_OFFSET = 6;

export const StackedImages = ({
  urls,
  size = 64,
  alt,
}: {
  urls: string[];
  size?: number;
  alt?: string;
}) => {
  const visible = urls.slice(0, MAX_STACK);
  if (!visible.length) return null;

  const extra = (visible.length - 1) * STACK_OFFSET;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size + extra, height: size + extra }}
    >
      {visible.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={alt ?? `image ${i + 1}`}
          className="absolute object-cover rounded shadow-sm"
          style={{
            width: size,
            height: size,
            top: i * STACK_OFFSET,
            left: i * STACK_OFFSET,
            zIndex: visible.length - i,
          }}
        />
      ))}
    </div>
  );
};
