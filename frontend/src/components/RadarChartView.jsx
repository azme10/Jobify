import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RadarChartView({ metrics }) {
  const data = metrics.map((m) => ({ subject: m.label, value: m.value, fullMark: 100 }));

  return (
    <div>
      <div className="h-64 w-full sm:h-72" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="62%" margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="var(--color-secondary)"
              fill="var(--color-secondary)"
              fillOpacity={0.25}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-card-foreground)",
                fontSize: 12,
              }}
              formatter={(value) => [`${value} / 100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Score breakdown across four evaluation dimensions</caption>
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Score out of 100</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label}>
              <th scope="row">{m.label}</th>
              <td>{m.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
