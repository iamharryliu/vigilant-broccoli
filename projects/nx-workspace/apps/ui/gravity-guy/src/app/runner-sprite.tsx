import { playerAccent } from './engine';

export const RunnerSprite = ({
  number,
  running = false,
}: {
  number: number;
  running?: boolean;
}) => {
  const accent = playerAccent(number, true);
  return (
    <svg
      className={running ? 'runner-sprite running' : 'runner-sprite'}
      viewBox="0 0 30 34"
      role="img"
      aria-label={`${number}`}
    >
      {running &&
        [0, 1, 2].map(index => (
          <rect
            key={index}
            className="runner-streak"
            x={-4 - index * 7}
            y={20}
            width={5 - index}
            height={2}
            fill={accent}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      <g className="runner-body">
        <rect x="1" y="1" width="28" height="28" rx="7" fill={accent} />
        <rect x="13" y="7" width="13" height="8" fill="#0c1728" />
        <rect x="20" y="9" width="4" height="3" fill="#efffff" />
      </g>
      <rect
        className="runner-leg runner-leg-a"
        x="5"
        y="29"
        width="7"
        height="5"
        fill={accent}
      />
      <rect
        className="runner-leg runner-leg-b"
        x="20"
        y="29"
        width="7"
        height="5"
        fill={accent}
      />
    </svg>
  );
};
