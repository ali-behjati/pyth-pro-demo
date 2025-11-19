import type { ArrayValues } from "type-fest";

export type Nullish<T> = T | null | undefined;

export const ALLOWED_CRYPTO_SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;

export type AllowedCryptoSymbolsType = ArrayValues<
  typeof ALLOWED_CRYPTO_SYMBOLS
>;

export function isAllowedCryptoSymbol(
  symbol: string,
): symbol is AllowedCryptoSymbolsType {
  for (const s of ALLOWED_CRYPTO_SYMBOLS) {
    if (s === symbol) return true;
  }

  return false;
}

export type DataSourcesCrypto =
  | "binance"
  | "coinbase"
  | "pyth"
  | "pythlazer"
  | "okx"
  | "bybit";

export type PriceData = {
  price: number;
  source: DataSourcesCrypto;
  timestamp: number;
};

export type PricePoint = {
  binance?: Nullish<number>;
  bybit?: Nullish<number>;
  coinbase?: Nullish<number>;
  okx?: Nullish<number>;
  pyth?: Nullish<number>;
  pythlazer?: Nullish<number>;
  timestamp: number;
};

export type CurrentPriceMetrics = {
  change: Nullish<number>;
  changePercent: Nullish<number>;
  data: PricePoint[];
  price: Nullish<number>;
};

export type CurrentCryptoPriceState = Record<
  DataSourcesCrypto,
  Nullish<CurrentPriceMetrics>
>;

export type CurrentPricesState = {
  state: Record<AllowedCryptoSymbolsType, CurrentCryptoPriceState>;
};
