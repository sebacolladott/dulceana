import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { ErrorPage } from "./error-page";
import { Root } from "./routes/root";
import { Inventory } from "./routes/inventory";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Inventory /> },
      { path: "/pos", element: <>POS</> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log("message", message);
});
