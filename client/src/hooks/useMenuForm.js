import { useState } from "react";

const initialFormState = {
  name: "",
  description: "",
  price: "",
  category: "appetizer",
  isVegetarian: false,
  isVegan: false,
  spicyLevel: "mild"
};

export function useMenuForm() {
  const [menuForm, setMenuForm] = useState(initialFormState);
  const [editingItem, setEditingItem] = useState(null);
  const [showMenuForm, setShowMenuForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      spicyLevel: item.spicyLevel || "mild"
    });
    setShowMenuForm(true);
  };

  const resetForm = () => {
    setMenuForm(initialFormState);
    setEditingItem(null);
    setShowMenuForm(false);
  };

  return {
    menuForm,
    editingItem,
    showMenuForm,
    setShowMenuForm,
    handleChange,
    startEdit,
    resetForm
  };
}
