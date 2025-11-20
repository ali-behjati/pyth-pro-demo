import type { DataSourcesCrypto } from "../types";

const palette: Partial<Record<DataSourcesCrypto, string>> = {
  binance: "red",
  bybit: "blue",
  coinbase: "green",
  okx: "orange",
  pyth: "purple",
  pythlazer: "teal",
};

/**
 * normalizes colors used for all data sources
 */
export function getColorForDataSource(dataSource: DataSourcesCrypto) {
  return palette[dataSource] ?? "gray";
}
