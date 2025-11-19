import { useCallback } from "react";

import type { PriceData } from "../types";
import { useFetchUsdtToUsdRate } from "./useFetchUsdtToUsdRate";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";
import { isNullOrUndefined } from "../util";

type BybitOrderBookData = {
  topic: string;
  type: string;
  ts: number;
  data: {
    s: string; // symbol
    b?: [string, string][]; // bids [price, size]
    a?: [string, string][]; // asks [price, size]
    u: number; // update id
    seq: number; // sequence number
  };
};

export const useBybitWebSocket = (onPriceUpdate: (data: PriceData) => void) => {
  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      const subscribeMessage = {
        op: "subscribe",
        args: ["orderbook.1.BTCUSDT"],
      };
      socket.json(subscribeMessage);
    },
    [],
  );
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>((_, e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const data = JSON.parse(e.data) as Partial<
      BybitOrderBookData & { topic: string; type: string }
    >;

    // Handle orderbook updates
    if (
      (data.topic === "orderbook.1.BTCUSDT" && data.type === "snapshot") ||
      data.type === "delta"
    ) {
      const orderBookData = data as BybitOrderBookData;
      const bookData = orderBookData.data;

      if (bookData.b?.length && bookData.a?.length) {
        // Get best bid and ask (first elements in the arrays)
        const bestBid = Number.parseFloat(bookData.b[0]?.[0] ?? "");
        const bestAsk = Number.parseFloat(bookData.a[0]?.[0] ?? "");
        const midPriceUSDT = (bestBid + bestAsk) / 2;

        // Convert USDT to USD using the fetched rate
        if (!isNullOrUndefined(usdtToUsdRate)) {
          const midPriceUSD = midPriceUSDT * usdtToUsdRate;

          onPriceUpdate({
            price: midPriceUSD,
            timestamp: Date.now(),
            source: "bybit",
          });
        }
      }
    }
  }, []);

  /** hooks */
  const { usdtToUsdRate } = useFetchUsdtToUsdRate({ refetchInterval: 10_000 });
  const { close, reconnect, status } = useWebSocket(
    "wss://stream.bybit.com/v5/public/spot",
    { onMessage, onOpen },
  );

  return {
    isConnected: status === "connected",
    reconnect,
    disconnect: close,
  };
};
