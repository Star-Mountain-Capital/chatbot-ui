import Plot from "react-plotly.js";

export interface ChartRendererProps {
  data: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function ChartRenderer({ data }: ChartRendererProps) {
  if (!isRecord(data)) {
    return <div className="text-muted-foreground">No chart data.</div>;
  }

  const chartType = String(data.chart_type || "unknown");

  let traces: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  switch (chartType) {
    case "line":
    case "bar":
    case "scatter":
    case "area": {
      const arr = (data as any).traces ?? [];
      traces = arr.map((t: any) => ({
        type: chartType === "area" ? "scatter" : chartType,
        mode:
          chartType === "scatter" || chartType === "line" ? "lines" : undefined,
        name: t.name,
        x: t.x,
        y: t.y,
        fill: chartType === "area" ? "tozeroy" : undefined,
      }));
      break;
    }
    case "pie": {
      traces = [
        {
          type: "pie",
          labels: (data as any).labels,
          values: (data as any).values,
        },
      ];
      break;
    }
    default: {
      // Attempt to plot whatever structure was provided.
      if (Array.isArray((data as any).traces)) {
        traces = (data as any).traces;
      }
    }
  }

  if (!traces.length) {
    return <div className="text-destructive">Unable to render chart data.</div>;
  }
  console.log(traces);

  return (
    <Plot
      data={traces}
      layout={{
        autosize: true,
        margin: { t: 20, r: 10, b: 80, l: 40 },
        legend: { orientation: "h" },
        xaxis: {
          tickangle: -90,
          automargin: true,
        },
      }}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
      config={{ displaylogo: false }}
    />
  );
}
