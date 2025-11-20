/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback, useEffect, useRef } from "react";
import type Sockette from "sockette";
import { v4 as uuid } from "uuid";

import { useAppStateContext } from "../context";
import type {
  AllowedForexSymbolsType,
  UseDataProviderSocketHookReturnType,
} from "../types";
import { isAllowedForexDataSource } from "../util";

type SubscribeReq = {
  cmd_id: number; // 22004 (ticks) or 22002 (depth)
  seq_id: number;
  trace: string;
  data: {
    symbol_list: { code: AllowedForexSymbolsType; depth_level?: number }[];
  };
};

type HeartbeatReq = {
  cmd_id: 22_000;
  seq_id: number;
  trace: string;
  data: Record<string, never>;
};

type TickPush = {
  cmd_id: 22_998;
  data: {
    code: string;
    seq: string;
    tick_time: string;
    price: string;
    volume?: string;
    turnover?: string;
    trade_direction?: 0 | 1 | 2;
  };
};

// Push messages (depth)
type DepthEntry = {
  price: string;
  volume?: string;
};

type DepthPush = {
  cmd_id: 22_999;
  data: {
    code: string;
    seq: string;
    tick_time: string;
    bids: DepthEntry[];
    asks: DepthEntry[];
  };
};

// Ack responses
type AckResponse = {
  ret: number; // 200 = OK
  msg: string;
  cmd_id: number; // e.g. 22005, 22003
  seq_id: number;
  trace: string;
  data?: Record<string, never>; // ACKs return either {} or nothing
};

type PushMessage = TickPush | DepthPush | AckResponse;

export function useAllTickWebSocket(): UseDataProviderSocketHookReturnType {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** refs */
  const isAuthenticated = useRef(false);
  const subscriptionActive = useRef(false);
  const heartbeatRef = useRef<NodeJS.Timeout>(undefined);

  /** callbacks */
  const onMessage = useCallback<
    UseDataProviderSocketHookReturnType["onMessage"]
  >(
    (_, __, strData) => {
      const msg = JSON.parse(strData) as PushMessage;

      // -------------------------------
      // ACK — subscription or heartbeat
      // -------------------------------
      if ("ret" in msg) {
        subscriptionActive.current = true;
        return;
      }

      // -------------------------------
      // LAST TRADE (TickPush)
      // -------------------------------
      if (msg.cmd_id === 22_998) {
        const { data } = msg;

        const last = Number.parseFloat(data.price);

        if (isAllowedForexDataSource(selectedSource)) {
          addDataPoint("alltick", selectedSource, {
            price: last,
            timestamp: Number(data.tick_time), // better than Date.now()
          });
        }

        return;
      }

      // -------------------------------
      // DEPTH (DepthPush)
      // -------------------------------
      if (msg.cmd_id === 22_999) {
        const { data } = msg;

        const bid = data.bids[0]?.price
          ? Number.parseFloat(data.bids[0].price)
          : undefined;

        const ask = data.asks[0]?.price
          ? Number.parseFloat(data.asks[0].price)
          : undefined;

        if (bid !== undefined && ask !== undefined) {
          const mid = (bid + ask) / 2;

          if (isAllowedForexDataSource(selectedSource)) {
            addDataPoint("alltick", selectedSource, {
              price: mid,
              timestamp: Number(data.tick_time),
            });
          }
        }

        return;
      }
    },
    [addDataPoint, selectedSource],
  );

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
  }, []);

  const startHeartbeat = useCallback(
    (s: Sockette) => {
      // we have to heartbeat the alltick endpoint or it'll
      // automatically close on us.
      clearHeartbeat();

      heartbeatRef.current = setInterval(() => {
        const msg: HeartbeatReq = {
          cmd_id: 22_000,
          data: {},
          seq_id: 1,
          trace: uuid(),
        };
        s.json(msg);
      }, 1000 * 10);
    },
    [clearHeartbeat],
  );

  const onOpen = useCallback<
    NonNullable<UseDataProviderSocketHookReturnType["onOpen"]>
  >(
    (s) => {
      startHeartbeat(s);

      if (!isAllowedForexDataSource(selectedSource)) return;

      // Subscribe to ticks (last trade)
      const tickReq: SubscribeReq = {
        cmd_id: 22_004, // tick subscription
        seq_id: 1,
        trace: uuid(),
        data: {
          symbol_list: [{ code: selectedSource }],
        },
      };
      s.json(tickReq);

      // Subscribe to depth (bid/ask)
      const depthReq: SubscribeReq = {
        cmd_id: 22_002, // depth subscription
        seq_id: 2,
        trace: uuid(),
        data: {
          symbol_list: [{ code: selectedSource, depth_level: 1 }],
        },
      };
      s.json(depthReq);
    },
    [selectedSource, startHeartbeat],
  );

  /** effects */
  useEffect(() => {
    // whenever the user makes a new selection,
    // ensure the websocket has to go through the whole
    // procedure over again
    subscriptionActive.current = false;
    isAuthenticated.current = false;
    clearHeartbeat();
  }, [selectedSource]);

  return { onMessage, onOpen };
}
