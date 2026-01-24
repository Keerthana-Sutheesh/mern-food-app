import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useRestaurantForm } from "../hooks/useRestaurantForm";
import { useMyRestaurant } from "../hooks/useMyRestaurant";
import { useRestaurantSubmit } from "../hooks/useRestaurantSubmit";

export default function CreateRestaurant() {
  const navigate = useNavigate();

  const {
    form,
    setForm,
    handleChange,
    addArrayItem,
    removeArrayItem,
  } = useRestaurantForm();

  const existingRestaurant = useMyRestaurant(setForm);
  const submitRestaurant = useRestaurantSubmit(navigate);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitRestaurant({
      form,
      existingRestaurant,
      setError,
      setSuccess,
      setLoading,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {existingRestaurant ? "🏪 Update Restaurant" : "🏪 Create Restaurant"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Restaurant Name"
            required
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <select
            name="cuisine"
            value={form.cuisine}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Cuisine</option>
            <option value="Indian">Indian</option>
            <option value="Chinese">Chinese</option>
            <option value="Italian">Italian</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

       
          <input
            type="text"
            placeholder="Add Service & press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArrayItem("services", e.target.value);
                e.target.value = "";
              }
            }}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          {form.services.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
              {form.services.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full font-medium">
                  {s}
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem("services", i)}
                    className="ml-1 hover:text-orange-900 dark:hover:text-orange-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {error && <p className="text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">❌ {error}</p>}
          {success && <p className="text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">✅ {success}</p>}

          <button
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white py-3 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Saving..." : "💾 Save"}
          </button>
        </form>

        <Link to="/owner" className="block text-center mt-4 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
