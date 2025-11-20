import type { AllDataSourcesType } from "../types";

const palette: Partial<Record<AllDataSourcesType, string>> = {
  binance: "red",
  bybit: "blue",
  coinbase: "green",
  okx: "orange",
  prime_api: "#ff4466",
  pyth: "purple",
  pyth_lazer: "teal",
};

/**
 * normalizes colors used for all data sources
 */
export function getColorForDataSource(dataSource: AllDataSourcesType) {
  return palette[dataSource] ?? "gray";
}
