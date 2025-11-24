import "./globals.css";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PrimeReactProvider } from "primereact/api";
import React from "react";
import ReactDOM from "react-dom/client";

import "primeicons/primeicons.css";
import { AppV2 } from "./AppV2";
import { AppStateProvider, ThemeProvider } from "./context";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <PrimeReactProvider>
    <ThemeProvider>
      <AppStateProvider>
        <AppV2 />
      </AppStateProvider>
    </ThemeProvider>
  </PrimeReactProvider>,
);
