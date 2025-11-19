/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { App } from "./App";
import { AppStateProvider } from "./context";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <AppStateProvider>
    <App />
  </AppStateProvider>,
);
