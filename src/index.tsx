import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store"; // Changed: removed { } brackets
import App from "./App";
// @ts-ignore: side-effect import of CSS without type declarations
import "bootstrap/dist/css/bootstrap.min.css";
// @ts-ignore: side-effect import of CSS without type declarations
import "bootstrap-icons/font/bootstrap-icons.css";
// app custom styles - create this file or comment out
// import "./styles/custom.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
