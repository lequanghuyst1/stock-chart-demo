import type { StockData } from "./type";
import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  LineSeries,
  type ChartOptions,
  type DeepPartial,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import { Box } from "@mui/material";

type StockChartProps = {
  stockData: StockData[];
};

const CHART_CONFIG: DeepPartial<ChartOptions> = {
  autoSize: true,
  layout: {
    background: { color: "#000000" },
    textColor: "#d1d5db",
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: "rgba(255,255,255,0.1)" },
  },
  leftPriceScale: {
    visible: true,
    borderColor: "#1f2937",
  },
  rightPriceScale: {
    visible: false,
  },
  timeScale: {
    borderColor: "#1f2937",
    timeVisible: true,
    secondsVisible: false,
  },
  crosshair: {
    mode: 0,
    vertLine: { color: "#3b82f6", width: 1, style: 2 },
    horzLine: { color: "#3b82f6", width: 1, style: 2 },
  },
  handleScroll: { mouseWheel: true, pressedMouseMove: true },
  handleScale: {
    axisPressedMouseMove: { time: true, price: true },
    mouseWheel: true,
    pinch: true,
  },
};

function StockChart({ stockData }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const toolTipRef = useRef<HTMLDivElement | null>(null);

  const lineData: LineData[] = useMemo(() => {
    if (!stockData) return [];
    return stockData.map((d: any) => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
      value: Number(d.close),
    }));
  }, [stockData]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, CHART_CONFIG);

    // line series
    const series = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 2,
      lastValueVisible: true,
      priceLineVisible: true,
      crosshairMarkerVisible: true,
    });

    // tooltip
    const toolTip = document.createElement("div");
    toolTip.style.position = "absolute";
    toolTip.style.display = "none";
    toolTip.style.background = "rgba(0,0,0,0.8)";
    toolTip.style.color = "#fff";
    toolTip.style.padding = "6px 10px";
    toolTip.style.borderRadius = "6px";
    toolTip.style.fontSize = "12px";
    toolTip.style.pointerEvents = "none";
    toolTip.style.zIndex = "1000";
    containerRef.current.appendChild(toolTip);

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time) {
        toolTip.style.display = "none";
        return;
      }
      const data = param.seriesData.get(series) as
        | LineData<UTCTimestamp>
        | undefined;
      if (data?.value !== undefined) {
        const ts = (param.time as number) * 1000;
        const utcStr = new Date(ts)
          .toISOString()
          .replace("T", " ")
          .slice(0, 19);

        toolTip.style.display = "block";
        toolTip.innerHTML = `📅 ${utcStr} UTC <br/> 💲 ${data.value.toFixed(
          2
        )}`;
        toolTip.style.left = param.point.x + 15 + "px";
        toolTip.style.top = param.point.y + "px";
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;
    toolTipRef.current = toolTip;

    return () => {
      chart.remove();
      toolTip.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && lineData.length) {
      try {
        console.log("Cập nhật dữ liệu biểu đồ:", lineData);
        seriesRef.current.setData(lineData);
        chartRef.current?.timeScale().fitContent();
      } catch (error) {
        console.error("Lỗi khi cập nhật dữ liệu biểu đồ:", error);
      }
    }
  }, [lineData]);

  return <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />;
}

export default StockChart;
