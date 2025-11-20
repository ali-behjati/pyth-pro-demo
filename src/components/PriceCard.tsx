import { capitalCase } from "change-case";
import React from "react";

import { API_TOKEN_PRIME_API } from "../constants";
import { useAppStateContext } from "../context";
import type { useWebSocket } from "../hooks/useWebSocket";
import type { AllDataSourcesType, Nullish } from "../types";
import { getColorForDataSource, isNullOrUndefined } from "../util";

type PriceCardProps = Pick<ReturnType<typeof useWebSocket>, "status"> & {
  dataSource: AllDataSourcesType;
};

const MAX_PRECISION = 6;
const MIN_PRECISION = 2;

const formatChange = (
  change: Nullish<number>,
  changePercent: Nullish<number>,
): string => {
  if (isNullOrUndefined(change) || isNullOrUndefined(changePercent)) {
    return "N/A";
  }
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(
    MAX_PRECISION,
  )} (${sign}${changePercent.toFixed(MAX_PRECISION)}%)`;
};

const formatPrice = (price: Nullish<number>): string => {
  if (typeof price !== "number") return "N/A";
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: MIN_PRECISION,
    maximumFractionDigits: MAX_PRECISION,
  });
};

const getChangeClass = (change: Nullish<number>): string => {
  if (typeof change !== "number") return "price-neutral";
  if (change > 0) return "price-positive";
  if (change < 0) return "price-negative";
  return "price-neutral";
};

export function PriceCard({ dataSource, status }: PriceCardProps) {
  /** context */
  const state = useAppStateContext();
  const { selectedSource: symbol } = state;

  if (isNullOrUndefined(symbol)) return null;

  const metrics = state[dataSource].latest?.[symbol];

  switch (dataSource) {
    case "prime_api": {
      if (!API_TOKEN_PRIME_API) {
        return (
          <div className="price-card">
            Please provide your Prime API access token to continue
          </div>
        );
      }
      break;
    }
    case "pyth_lazer": {
      if (!API_TOKEN_PRIME_API) {
        return (
          <div className="price-card">
            Please provide your PYTH Pro / Lazer access token to continue
          </div>
        );
      }
      break;
    }
    default: {
      break;
    }
  }

  return (
    <div className="price-card">
      <h3 style={{ color: getColorForDataSource(dataSource) }}>
        <span className="status-indicator"></span>
        {capitalCase(dataSource)}: {symbol.toUpperCase()}
      </h3>
      {metrics && (
        <>
          <div className="price-value">{formatPrice(metrics.price)}</div>
          <div className={`price-change ${getChangeClass(metrics.change)}`}>
            {formatChange(metrics.change, metrics.changePercent)}
          </div>
        </>
      )}
      {!metrics && status === "connected" && (
        <div className="price-value">No data received</div>
      )}
      <div>{status}</div>
    </div>
  );
}

export default PriceCard;
