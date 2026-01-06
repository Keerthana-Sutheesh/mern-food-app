import { useState } from "react";

const initialFormState = {
  name: "",
  description: "",
  price: "",
  category: "appetizer",
  dietType: "non-veg",
  spicyLevel: "mild",
  nutritionalInfo: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  }
};

export function useMenuForm() {
  const [menuForm, setMenuForm] = useState(initialFormState);
  const [editingItem, setEditingItem] = useState(null);
  const [showMenuForm, setShowMenuForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested nutritional info
    if (name.startsWith("nutritionalInfo.")) {
      const key = name.split(".")[1];
      setMenuForm((prev) => ({
        ...prev,
        nutritionalInfo: {
          ...prev.nutritionalInfo,
          [key]: Number(value)
        }
      }));
    } else {
      setMenuForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      dietType: item.isVegan ? 'vegan' : item.isVegetarian ? 'vegetarian' : 'non-veg',
      spicyLevel: item.spicyLevel || "mild",
      nutritionalInfo: {
        calories: item.nutritionalInfo?.calories || 0,
        protein: item.nutritionalInfo?.protein || 0,
        carbs: item.nutritionalInfo?.carbs || 0,
        fat: item.nutritionalInfo?.fat || 0,
        fiber: item.nutritionalInfo?.fiber || 0
      }
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
