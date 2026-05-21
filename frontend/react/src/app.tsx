import { RouterProvider } from "react-router-dom";
import { ecomRouter, EcomProviders } from "#ecom/index";

export function App() {
  return (
    <EcomProviders>
      <RouterProvider router={ecomRouter} />
    </EcomProviders>
  );
}
