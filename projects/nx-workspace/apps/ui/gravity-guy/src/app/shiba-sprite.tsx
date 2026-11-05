export const ShibaSprite = ({ running = false }: { running?: boolean }) => (
  <svg
    className={running ? 'shiba-sprite running' : 'shiba-sprite'}
    viewBox="-62 -36 108 54"
    aria-hidden="true"
  >
    <g className="shiba-body">
      {running && (
        <g className="shiba-plume">
          <polygon points="-23,-25 -48,-21 -23,-16" fill="#28b9ff" />
          <polygon points="-23,-23 -42,-21 -23,-19" fill="#c5f6ff" />
        </g>
      )}
      <rect
        x="-25"
        y="-30"
        width="29"
        height="20"
        rx="5"
        fill="#60758d"
        stroke="#142437"
        strokeWidth="2"
      />
      <rect x="-28" y="-26" width="7" height="11" fill="#b9cddd" />
      <rect x="-15" y="-26" width="12" height="3" fill="#60ead7" />
      <line x1="-4" y1="-12" x2="0" y2="10" stroke="#142437" strokeWidth="4" />
      <ellipse
        cx="-5"
        cy="0"
        rx="24"
        ry="12"
        fill="#202937"
        stroke="#080d16"
        strokeWidth="2"
      />
      <circle
        cx="-29"
        cy="-9"
        r="9"
        fill="none"
        stroke="#303c4e"
        strokeWidth="8"
      />
      <circle
        cx="-29"
        cy="-9"
        r="5"
        fill="none"
        stroke="#f1e4cf"
        strokeWidth="3"
        strokeDasharray="22 10"
      />
      <ellipse cx="-1" cy="5" rx="18" ry="6" fill="#f1e4cf" />
      {[-20, 9].map((x, index) => (
        <g
          key={x}
          className={
            index === 0 ? 'shiba-leg shiba-leg-a' : 'shiba-leg shiba-leg-b'
          }
        >
          <rect x={x} y="6" width="7" height="10" fill="#202937" />
          <rect x={x} y="13" width="8" height="4" fill="#f1e4cf" />
        </g>
      ))}
      <polygon
        points="9,-14 12,-32 24,-22 34,-31 39,-11"
        fill="#202937"
        stroke="#080d16"
        strokeWidth="2"
      />
      <ellipse
        cx="24"
        cy="-9"
        rx="17"
        ry="15"
        fill="#202937"
        stroke="#080d16"
        strokeWidth="2"
      />
      <ellipse
        cx="30"
        cy="-2"
        rx="13"
        ry="8"
        fill="#f1e4cf"
        transform="rotate(-11.5 30 -2)"
      />
      <circle cx="29" cy="-13" r="2.3" fill="#302a29" />
      <circle cx="41" cy="-5" r="3" fill="#302a29" />
      <line
        x1="23"
        y1="-19"
        x2="29"
        y2="-20"
        stroke="#f1e4cf"
        strokeWidth="3"
      />
    </g>
  </svg>
);
