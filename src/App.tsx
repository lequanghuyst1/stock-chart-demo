import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import { Typography, Button, Stack, Paper, Box, Alert } from "@mui/material";
import useSWR from "swr";

export interface StockData {
  date: string;
  close: number;
}

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const TIME_FRAMES = ["hourly", "daily", "weekly", "monthly"] as const;
type TimeFrame = (typeof TIME_FRAMES)[number];

export default function App() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("daily");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const toolTipRef = useRef<HTMLDivElement | null>(null);

  // dùng SWR call API
  const { data: apiData, error } = useSWR(
    `https://chart.stockscan.io/candle/v3/TSLA/${timeFrame}/NASDAQ`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
    }
  );

  // map dữ liệu
  const lineData: LineData[] = useMemo(() => {
    if (!apiData?.candles) return [];
    return apiData.candles.map((d: any) => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
      value: Number(d.close),
    }));
  }, [apiData]);

  // init chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#000000" }, // nền đen
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.1)" },
      },
      leftPriceScale: {
        visible: true, // Hiển thị trục giá bên trái
        borderColor: "#1f2937", // Viền trục giá
      },
      rightPriceScale: {
        visible: false, // Ẩn trục giá bên phải
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
    });

    // line series
    const series = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 2,
      lastValueVisible: false, // vẫn hiển thị label giá cuối bên phải
      priceLineVisible: false, // ❌ tắt đường ngang cố định
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

  if (error) {
    return <Alert severity="error">Failed to load data</Alert>;
  }

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", bgcolor: "#000" }}>
      <Stack sx={{ p: 2, height: "100%" }} spacing={2}>
        <Typography variant="h5" fontWeight={700} color="#e2e8f0">
          TSLA Stock
        </Typography>

        {/* Buttons */}
        <Stack direction="row" spacing={1}>
          {TIME_FRAMES.map((tf) => (
            <Button
              key={tf}
              variant={timeFrame === tf ? "contained" : "outlined"}
              onClick={() => setTimeFrame(tf)}
              sx={{
                textTransform: "capitalize",
                borderRadius: 3,
                px: 2.5,
                fontWeight: 600,
                ...(timeFrame === tf
                  ? {
                      bgcolor: "#3b82f6",
                      color: "#fff",
                      "&:hover": { bgcolor: "#2563eb" },
                    }
                  : {
                      borderColor: "#374151",
                      color: "#cbd5e1",
                      "&:hover": { bgcolor: "#1f2937" },
                    }),
              }}
            >
              {tf}
            </Button>
          ))}
        </Stack>

        {/* Chart */}
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            flex: 1,
            minHeight: 0,
            bgcolor: "#000",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />
        </Paper>
      </Stack>
    </Box>
  );
}
