/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useCallback, useRef } from "react";

import type { PriceData } from "../types";
import { useFetchUsdtToUsdRate } from "./useFetchUsdtToUsdRate";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";

type BinanceOrderBookData = {
  s: string; // symbol
  b: string; // best bid price
  B: string; // best bid quantity
  a: string; // best ask price
  A: string; // best ask quantity
};

export const useBinanceWebSocket = (
  onPriceUpdate: (data: PriceData) => void,
  onStatusChange: (status: "connected" | "disconnected" | "connecting") => void,
) => {
  /** refs */
  const onStatusChangeRef = useRef(onStatusChange);

  /** callbacks */
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>((_, e) => {
    try {
      const data = JSON.parse(e.data) as BinanceOrderBookData;
      if (data.s === "BTCUSDT") {
        // Calculate mid price from best bid and best ask
        const bestBid = Number.parseFloat(data.b);
        const bestAsk = Number.parseFloat(data.a);
        const midPriceUSDT = (bestBid + bestAsk) / 2;

        // Convert USDT to USD using the fetched rate
        const midPriceUSD = midPriceUSDT * usdtToUsdRate;

        onPriceUpdate({
          price: midPriceUSD,
          timestamp: Date.now(),
          source: "binance",
        });
      }
    } catch {
      // Ignore malformed WebSocket payloads
    }
  }, []);

  /** hooks */
  const { usdtToUsdRate } = useFetchUsdtToUsdRate({ refetchInterval: 10_000 });
  const { close, reconnect, status } = useWebSocket(
    "wss://stream.binance.com:9443/ws/btcusdt@bookTicker",
    { onMessage },
  );

  /** effects */
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  });
  useEffect(() => {
    switch (status) {
      case "closed": {
        onStatusChangeRef.current("disconnected");
        return;
      }
      case "connected": {
        onStatusChangeRef.current("connected");
        return;
      }
      case "connecting":
      case "reconnecting": {
        onStatusChangeRef.current("connecting");
        return;
      }
      default: {
        break;
      }
    }
  }, [status]);

  return {
    isConnected: status === "connected",
    reconnect,
    disconnect: close,
  };
};
