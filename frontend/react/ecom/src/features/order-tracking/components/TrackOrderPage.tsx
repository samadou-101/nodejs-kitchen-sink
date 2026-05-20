import { useState } from "react";
import { useTrackOrders } from "../api/use-order-tracking";
import { TrackOrderForm } from "./TrackOrderForm";
import { OrderTrackResult } from "./OrderTrackResult";

export function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const { data: orders, isLoading } = useTrackOrders(phone);

  const handleSearch = (p: string) => {
    setPhone(p);
    setSearched(true);
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold">Track Your Order</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your phone number to look up your orders.
      </p>
      <div className="mt-4">
        <TrackOrderForm onSubmit={handleSearch} isLoading={isLoading} />
      </div>
      <OrderTrackResult orders={orders} isLoading={isLoading} searched={searched} />
    </div>
  );
}
