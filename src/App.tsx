import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Typography, Button, Stack, Paper, Box } from "@mui/material";
import {
  createChart,
  IChartApi,
  LineSeriesPartialOptions,
} from "lightweight-charts";

export interface StockData {
  date: string;
  close: number;
}

const TIME_FRAMES = ["hourly", "daily", "weekly", "monthly"] as const;
type TimeFrame = (typeof TIME_FRAMES)[number];

function App() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("daily");
  const [data, setData] = useState<StockData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://chart.stockscan.io/candle/v3/TSLA/${timeFrame}/NASDAQ`;
        const res = await axios.get(url);

        const formatted: StockData[] = res.data?.candles.map((item: any) => ({
          date: item.date,
          close: item.close,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [timeFrame]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header + buttons */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          TSLA Stock Chart
        </Typography>

        <Stack direction="row" spacing={2}>
          {TIME_FRAMES.map((tf) => (
            <Button
              key={tf}
              variant={timeFrame === tf ? "contained" : "outlined"}
              onClick={() => setTimeFrame(tf)}
              sx={{
                borderRadius: "20px",
                textTransform: "capitalize",
                fontWeight: 600,
                px: 3,
                py: 1,
                ...(timeFrame === tf
                  ? {
                      bgcolor: "#26a69a", // xanh ngọc dịu mắt
                      color: "#fff",
                      "&:hover": { bgcolor: "#1e857d" }, // hover đậm hơn một chút
                    }
                  : {
                      borderColor: "#555",
                      color: "#d1d4dc",
                      "&:hover": { bgcolor: "#2a2e39" },
                    }),
              }}
            >
              {tf}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Chart chiếm toàn bộ phần còn lại */}
      <Box sx={{ flex: 1, p: 3, pt: 0, borderRadius: 2, overflow: "hidden" }}>
        <Paper
          elevation={3}
          sx={{ height: "100%", bgcolor: "#131722", pt: 2 }} // nền tối
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              {/* Grid */}
              <CartesianGrid
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="3 3"
              />

              {/* Trục X */}
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#d1d4dc" }}
                axisLine={{ stroke: "#2a2e39" }}
                tickLine={{ stroke: "#2a2e39" }}
                minTickGap={20}
              />

              {/* Trục Y */}
              <YAxis
                dataKey="close"
                domain={["auto", "auto"]}
                tick={{ fontSize: 12, fill: "#d1d4dc" }}
                axisLine={{ stroke: "#2a2e39" }}
                tickLine={{ stroke: "#2a2e39" }}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e222d",
                  border: "none",
                  borderRadius: "6px",
                  color: "#d1d4dc",
                }}
              />

              {/* Line giá */}
              <Line
                type="monotone"
                dataKey="close"
                stroke="#26a69a" // xanh ngọc giống chart tăng
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;

function StockChart({ data }: { data: DataPoint[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Tạo chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#131722" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.1)" },
        horzLines: { color: "rgba(255,255,255,0.1)" },
      },
      crosshair: {
        mode: 0,
      },
    });
    chartRef.current = chart;

    // Thêm line series (API mới)
    const lineSeries = chart.addSeries({
      type: "Line",
      options: {
        Line: {
          color: "#26a69a",
          lineWidth: 2,
        },
      },
    });

    lineSeries.setData(data);

    // Resize responsive
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
  );
}
