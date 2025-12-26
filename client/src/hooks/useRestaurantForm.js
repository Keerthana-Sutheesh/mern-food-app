import { useState } from "react";

const initialState = {
  name: "",
  address: "",
  cuisine: "",
  description: "",
  phone: "",
  image: "",
  deliveryTime: "30-45 mins",
  deliveryFee: 40,
  hoursOfOperation: "9:00 AM - 10:00 PM",
  priceRange: "$$",
  services: [],
  menuHighlights: [],
};

export function useRestaurantForm() {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addArrayItem = (field, value) => {
    if (!value.trim()) return;
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return {
    form,
    setForm,
    handleChange,
    addArrayItem,
    removeArrayItem,
  };
}
