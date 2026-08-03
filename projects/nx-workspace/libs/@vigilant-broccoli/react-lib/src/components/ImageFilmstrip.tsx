const THUMBNAIL_SIZE = 96;
const DEFAULT_ALT = 'image';

export const ImageFilmstrip = ({
  urls,
  alt,
  onSelect,
  size = THUMBNAIL_SIZE,
}: {
  urls: string[];
  alt?: string;
  onSelect: (index: number) => void;
  size?: number;
}) => {
  if (!urls.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {urls.map((url, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className="shrink-0 overflow-hidden rounded-lg shadow-sm"
          style={{ width: size, height: size }}
        >
          <img
            src={url}
            alt={`${alt ?? DEFAULT_ALT} ${i + 1}`}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};
