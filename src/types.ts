import type { ArrayValues } from "type-fest";

export type Nullish<T> = T | null | undefined;

export const ALLOWED_CRYPTO_SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;

export const DATA_SOURCES_CRYPTO = [
  "binance",
  "bybit",
  "coinbase",
  "okx",
  "pyth",
  "pythlazer",
] as const;

export type AllowedCryptoSymbolsType = ArrayValues<
  typeof ALLOWED_CRYPTO_SYMBOLS
>;

export function isAllowedCryptoSymbol(
  symbol: Nullish<string>,
): symbol is AllowedCryptoSymbolsType {
  for (const s of ALLOWED_CRYPTO_SYMBOLS) {
    if (s === symbol) return true;
  }

  return false;
}

export type DataSourcesCrypto = ArrayValues<typeof DATA_SOURCES_CRYPTO>;

export type PriceData = {
  price: number;
  timestamp: number;
};

export type CurrentPriceMetrics = {
  change: Nullish<number>;
  changePercent: Nullish<number>;
  price: Nullish<number>;
  timestamp: number;
};

export type LatestMetric = Partial<
  Record<AllowedCryptoSymbolsType, CurrentPriceMetrics>
>;

export type AllAndLatestDataState = {
  all: Partial<Record<AllowedCryptoSymbolsType, CurrentPriceMetrics[]>>;
  latest: Nullish<LatestMetric>;
};

export type CurrentPricesState = Record<
  DataSourcesCrypto,
  AllAndLatestDataState
> & {
  selectedSource: Nullish<AllowedCryptoSymbolsType>;
};

const SOURCE_SELECTOR_OPTS = ALLOWED_CRYPTO_SYMBOLS.map((symbol) => ({
  label: symbol,
  group: "crypto",
  value: symbol,
}));

export const GROUPED_SOURCE_SELECTOR_OPTS = Object.groupBy(
  SOURCE_SELECTOR_OPTS,
  (opt) => opt.group,
);
