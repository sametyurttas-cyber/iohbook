"use client";

import type { CharacterStat } from "./characters-data";

type CharacterRadarProps = {
  stats: CharacterStat[];
  accentColor: string;
};

export function CharacterRadar({ stats, accentColor }: CharacterRadarProps) {
  const center = 70;
  const maxRadius = 45;
  const totalAxes = 6;

  // Calculate points for grid levels and active stat polygon
  const getCoordinates = (value: number, index: number) => {
    const angle = (index * (2 * Math.PI)) / totalAxes - Math.PI / 2;
    const r = (value / 10) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate background grid hexagons (levels 2, 4, 6, 8, 10)
  const gridLevels = [2, 4, 6, 8, 10];
  const gridPolygons = gridLevels.map((level) => {
    const points = stats
      .map((_, i) => {
        const { x, y } = getCoordinates(level, i);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return points;
  });

  // Calculate coordinates for the character's active stats polygon
  const activePoints = stats
    .map((stat, i) => {
      const { x, y } = getCoordinates(stat.value, i);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div style={{ width: "100%", maxWidth: "230px", margin: "0 auto" }}>
      <svg
        viewBox="0 0 140 140"
        className="w-full h-auto select-none"
        style={{ overflow: "visible" }}
      >
        {/* Background grids */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(242, 239, 232, 0.08)"
            strokeWidth="0.5"
          />
        ))}

        {/* Axis lines */}
        {stats.map((_, i) => {
          const outer = getCoordinates(10, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(242, 239, 232, 0.06)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Active stat area */}
        <polygon
          points={activePoints}
          fill={`${accentColor}24`} // 14% opacity glow
          stroke={accentColor}
          strokeWidth="1.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Dots on corners */}
        {stats.map((stat, i) => {
          const { x, y } = getCoordinates(stat.value, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill={accentColor}
              stroke="#05060a"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Text labels outside the corners */}
        {stats.map((stat, i) => {
          const angle = (i * (2 * Math.PI)) / totalAxes - Math.PI / 2;
          const labelDist = maxRadius + 14;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          // Fine tune label text anchoring
          let textAnchor: "start" | "end" | "middle" = "middle";
          if (Math.cos(angle) > 0.1) textAnchor = "start";
          if (Math.cos(angle) < -0.1) textAnchor = "end";

          return (
            <g key={i}>
              <text
                x={lx}
                y={ly}
                fill="rgba(242, 239, 232, 0.5)"
                fontSize="5.5"
                fontFamily="var(--font-mono)"
                letterSpacing="0.05em"
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                {stat.label.toUpperCase()}
              </text>
              <text
                x={lx}
                y={ly + 5.5}
                fill={accentColor}
                fontSize="5.5"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                {stat.value}/10
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
