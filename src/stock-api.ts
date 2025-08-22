import type { TimeFrame } from "./type";
import axios from "axios";
import useSWR from "swr";

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};
export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useGetStockData = (timeFrame: TimeFrame) => {
  const URL_API = `https://chart.stockscan.io/candle/v3/TSLA/${timeFrame}/NASDAQ`;

  const { data: apiData, error } = useSWR(URL_API, fetcher, options);

  return { apiData, error };
};
