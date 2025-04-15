import React, { useState, useEffect, useRef, useCallback } from "react";
import WaterfallChart from "../chart/waterfallcharttime";
import SYMBOLS from "./symbols";
import CandlestickChart from "../Candlestickchart/Candlestick";

const API_BASE_URL = "http://127.0.0.1:8000/historical";
// const API_BASE_URL = "http://3.28.119.113:8000/historical";
const MAX_CANDLES = 150;
const CACHE_SIZE = 10; // Keep 20 symbols in cache
const LOAD_BATCH = 10; // Load next 20 symbols in advance
const POLLING_INTERVAL = 1000;

const StocksFeedpython = () => {
  const [chartData, setChartData] = useState({});
  const [timeframe, setTimeframe] = useState("1h");
  const [startIndex, setStartIndex] = useState(0);
  const [visibleSymbols, setVisibleSymbols] = useState(
    SYMBOLS.slice(0, CACHE_SIZE)
  );
  const containerRef = useRef(null);

  // Fetch data for a given list of symbols and timeframe
  const fetchData = useCallback(async (symbols, selectedTimeframe) => {
    try {
      const responses = await Promise.all(
        symbols.map(async (symbol) => {
          const res = await fetch(
            `${API_BASE_URL}/${symbol}/${selectedTimeframe}`
          );
          const data = await res.json();
          return { symbol, data: data.data || [] };
        })
      );

      const formattedData = Object.fromEntries(
        responses.map(({ symbol, data }) => [
          symbol,
          data.slice(-MAX_CANDLES).map(({ time, waterfall, ...rest }) => ({
            date: new Date(time).toISOString(),
            value: waterfall ?? 0,
            ...rest,
          })),
        ])
      );

      setChartData((prev) => ({
        ...prev,
        ...formattedData,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  // Load initial symbols on mount
  useEffect(() => {
    fetchData(visibleSymbols, timeframe);
  }, [fetchData]);

  // Poll live updates every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(visibleSymbols, timeframe);
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [visibleSymbols, timeframe, fetchData]);

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setChartData({}); // Clear previous data
    fetchData(visibleSymbols, newTimeframe); // Refetch for current symbols
  };

  // Infinite Scroll Handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Scroll Down: Preload next 20 symbols
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setStartIndex((prev) => {
        const nextIndex = prev + LOAD_BATCH;
        if (nextIndex >= SYMBOLS.length) return prev;

        const newSymbols = SYMBOLS.slice(nextIndex, nextIndex + CACHE_SIZE);
        setVisibleSymbols((prevSymbols) => {
          const updatedSymbols = [...prevSymbols, ...newSymbols].slice(
            -CACHE_SIZE
          );
          fetchData(updatedSymbols, timeframe);
          return updatedSymbols;
        });

        return nextIndex;
      });
    }

    // Scroll Up: Load previous 20 symbols
    if (scrollTop <= 100) {
      setStartIndex((prev) => {
        const prevIndex = Math.max(0, prev - LOAD_BATCH);
        if (prevIndex === prev) return prev;

        const newSymbols = SYMBOLS.slice(prevIndex, prevIndex + CACHE_SIZE);
        setVisibleSymbols((prevSymbols) => {
          const updatedSymbols = [...newSymbols, ...prevSymbols].slice(
            0,
            CACHE_SIZE
          );
          fetchData(updatedSymbols, timeframe);
          return updatedSymbols;
        });

        return prevIndex;
      });
    }
  }, [fetchData, timeframe]);

  useEffect(() => {
    const div = containerRef.current;
    if (div) div.addEventListener("scroll", handleScroll);
    return () => div && div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  console.log(chartData)

  return (
    <div
      className="h-screen overflow-y-auto bg-[#05070a] text-white"
      ref={containerRef}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 bg-[#0b0e11] shadow-lg">
        <h3 className="text-xl font-bold text-green-500 font-mono">ChartAp</h3>

        <div className="flex space-x-4 py-1">
          {["5m", "15m", "1h", "4h","1w", "1d"].map((time) => (
            <button
              key={time}
              onClick={() => handleTimeframeChange(time)}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                timeframe === time
                  ? "bg-green-500 text-black"
                  : "bg-gray-700 text-white"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 p-4">
        {Object.keys(chartData).length > 0 ? (
          Object.entries(chartData).map(([symbol, data]) => (
            <div key={symbol} className=" bg-[#181a20] rounded-xl shadow-lg">
              <div className="flex justify-between px-5 pt-2">
                <h5 className="text-xl ">{symbol}</h5>
                <p className="text-gray-300">
                  LTP :{" "}
                  {data?.length ? data[data.length - 1].close : "Loading..."}
                </p>
              </div>
              <div className=" px-5 h-px  bg-gray-600 border-0 dark:bg-gray-700"></div>
              <WaterfallChart
                data={data}
                stockName={symbol}
                ltp={data?.length ? data[data.length - 1].close : "Loading..."}
              />

              {/* <CandlestickChart
                data={data}
                stockName={symbol}
                ltp={data?.length ? data[data.length - 1].close : "Loading..."}
              /> */}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">Loading data...</p>
        )}
      </div>
    </div>
  );
};

export default StocksFeedpython;
