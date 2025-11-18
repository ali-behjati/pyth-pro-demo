/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useRef, useCallback } from "react";

import type { PriceData } from "../types";
import { useFetchUsdtToUsdRate } from "./useFetchUsdtToUsdRate";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";

type OKXBBOData = {
  arg: {
    channel: string;
    instId: string;
  };
  data: {
    asks?: string[][]; // [price, size, liquidated_orders, number_of_orders] - only best ask
    bids?: string[][]; // [price, size, liquidated_orders, number_of_orders] - only best bid
    ts: string;
  }[];
};

export const useOKXWebSocket = (
  onPriceUpdate: (data: PriceData) => void,
  onStatusChange: (status: "connected" | "disconnected" | "connecting") => void,
) => {
  /** refs */
  const onStatusChangeRef = useRef(onStatusChange);

  /** hooks */
  const { usdtToUsdRate } = useFetchUsdtToUsdRate({ refetchInterval: 10_000 });

  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      const subscribeMessage = {
        op: "subscribe",
        args: [
          {
            channel: "bbo-tbt",
            instId: "BTC-USDT",
          },
        ],
      };
      socket.json(subscribeMessage);
    },
    [],
  );
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>((_, e) => {
    try {
      const data = JSON.parse(e.data) as Partial<OKXBBOData>;

      // Handle best bid/offer updates
      if (
        data.arg?.channel === "bbo-tbt" &&
        data.arg.instId === "BTC-USDT" &&
        data.data?.length
      ) {
        const bboData = data as OKXBBOData;
        const tickData = bboData.data[0];

        if (tickData?.bids?.length && tickData.asks?.length) {
          // Get best bid and ask (directly from bbo-tbt channel)
          const bestBid = Number.parseFloat(tickData.bids[0]?.[0] ?? "");
          const bestAsk = Number.parseFloat(tickData.asks[0]?.[0] ?? "");
          const midPriceUSDT = (bestBid + bestAsk) / 2;

          // Convert USDT to USD using the fetched rate
          const midPriceUSD = midPriceUSDT * usdtToUsdRate;

          onPriceUpdate({
            price: midPriceUSD,
            timestamp: Date.now(),
            source: "okx",
          });
        }
      }
    } catch {
      // Ignore malformed WebSocket payloads
    }
  }, []);

  const { close, reconnect, status } = useWebSocket(
    "wss://ws.okx.com:8443/ws/v5/public",
    {
      onOpen,
      onMessage,
    },
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
