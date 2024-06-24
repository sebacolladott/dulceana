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
window.ipcRenderer.invoke("getProducts").then((products) => {
  console.log(products);
});

// window.ipcRenderer.invoke("createProduct", {
//   barcode: "123456789",
//   name: "Pan blanco",
//   price: parseInt(2.99, 10),
//   unit_of_measurement: "kg",
// });
