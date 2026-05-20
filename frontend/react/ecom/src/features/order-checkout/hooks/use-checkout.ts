import { useState } from "react";
import { usePlaceOrder } from "../api/use-checkout";

interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

interface CheckoutErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export function useCheckout(onSuccess: (orderId: number) => void) {
  const [form, setForm] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const placeOrder = usePlaceOrder();

  const setField = (field: keyof CheckoutFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: CheckoutErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (items: { productId: number; quantity: number }[]) => {
    if (!validate()) return;
    if (items.length === 0) throw new Error("Your cart is empty");

    const order = await placeOrder.mutateAsync({
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      notes: form.notes || undefined,
      items,
    });

    onSuccess(order.orderId!);
  };

  return {
    form,
    errors,
    setField,
    submit,
    isSubmitting: placeOrder.isPending,
    error: placeOrder.error,
  };
}
