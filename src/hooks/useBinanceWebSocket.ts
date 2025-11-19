import { useCallback } from "react";
import { useShallow } from "zustand/shallow";

import { usePythProStore } from "../state";
import { isAllowedCryptoSymbol } from "../types";

type BinanceOrderBookData = {
  s: string; // symbol
  b: string; // best bid price
  B: string; // best bid quantity
  a: string; // best ask price
  A: string; // best ask quantity
};

export function useBinanceWebSocket() {
  /** store */
  const addPriceEntry = usePythProStore(
    useShallow((state) => state.addPriceEntry),
  );

  /** callbacks */
  const onMessage = useCallback((usdtToUsdRate: number, socketData: string) => {
    try {
      const data = JSON.parse(socketData) as BinanceOrderBookData;
      if (isAllowedCryptoSymbol(data.s)) {
        // Calculate mid price from best bid and best ask
        const bestBid = Number.parseFloat(data.b);
        const bestAsk = Number.parseFloat(data.a);
        const midPriceUSDT = (bestBid + bestAsk) / 2;

        // Convert USDT to USD using the fetched rate
        const midPriceUSD = midPriceUSDT * usdtToUsdRate;

        addPriceEntry(data.s, "binance", {
          price: midPriceUSD,
          timestamp: Date.now(),
          source: "binance",
        });
      }
    } catch {
      // Ignore malformed WebSocket payloads
    }
  }, []);

  return { onMessage };
}
