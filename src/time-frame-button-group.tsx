import { TIME_FRAMES, type TimeFrame } from "./type";
import { Stack, Button } from "@mui/material";

type Props = {
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
};

function TimeFrameButtonGroup({ timeFrame, setTimeFrame }: Props) {
  return (
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
  );
}

export default TimeFrameButtonGroup;
