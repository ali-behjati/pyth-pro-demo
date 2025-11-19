import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SocketteOptions } from "sockette";
import Sockette from "sockette";
import throttle from "throttleit";

export type UseWebSocketOpts = {
  enabled?: boolean;
  onClose?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onclose"]>>
  ) => void;
  onError?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onerror"]>>
  ) => void;
  onMessage: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onmessage"]>>
  ) => void;
  onOpen?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onopen"]>>
  ) => void;
  onReconnect?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<SocketteOptions["onreconnect"]>>
  ) => void;
};

export function useWebSocket(
  url: string,
  {
    enabled = true,
    onClose,
    onError,
    onMessage,
    onOpen,
    onReconnect,
  }: UseWebSocketOpts,
) {
  /** state */
  const [status, setStatus] = useState<
    "closed" | "connecting" | "connected" | "reconnecting"
  >("closed");

  /** refs */
  const wsRef = useRef<Sockette | undefined>(undefined);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onReconnectRef = useRef(onReconnect);

  /** callbacks */
  const connectSocket = useCallback(() => {
    if (!enabled) return;

    const w = new Sockette(url, {
      onclose: (...args) => {
        setStatus("closed");
        onCloseRef.current?.(w, ...args);
      },
      onerror: (...args) => {
        setStatus("closed");
        onErrorRef.current?.(w, ...args);
      },
      onmessage: (...args) => {
        onMessageRef.current(w, ...args);
      },
      onopen: (...args) => {
        setStatus("connected");
        onOpenRef.current?.(w, ...args);
      },
      onreconnect: (...args) => {
        setStatus("reconnecting");
        onReconnectRef.current?.(w, ...args);
      },
    });

    setStatus("connecting");

    wsRef.current = w;
  }, [url]);

  const closeSocket = useCallback(() => {
    wsRef.current?.close();
    setStatus("closed");
  }, []);

  /** effects */
  useEffect(() => {
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
    // onmessage can only get called at most once every 50 ms
    onMessageRef.current = throttle(onMessage, 50);
    onOpenRef.current = onOpen;
    onReconnectRef.current = onReconnect;
  });

  useEffect(() => {
    closeSocket();
    connectSocket();

    return () => {
      closeSocket();
    };
  }, [closeSocket, connectSocket]);

  return useMemo(
    () => ({
      close: closeSocket,
      reconnect: () => {
        setStatus("reconnecting");
        wsRef.current?.reconnect();
      },
      send: (content: unknown) => {
        wsRef.current?.send(content);
      },
      sendJson: (json: object) => {
        wsRef.current?.json(json);
      },
      status,
    }),
    [closeSocket, status],
  );
}
