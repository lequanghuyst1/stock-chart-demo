import { useState } from "react";

import { Typography, Stack, Paper, Box, Alert } from "@mui/material";
import StockChart from "./stock-chart";
import { useGetStockData } from "./stock-api";
import { type TimeFrame } from "./type";
import TimeFrameButtonGroup from "./time-frame-button-group";

export default function App() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("daily");

  const { apiData, error } = useGetStockData(timeFrame);

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
        <TimeFrameButtonGroup
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
        />

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
          <StockChart stockData={apiData?.candles} />
        </Paper>
      </Stack>
    </Box>
  );
}
