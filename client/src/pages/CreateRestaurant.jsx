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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {existingRestaurant ? "Update Restaurant" : "Create Restaurant"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Restaurant Name"
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="w-full border p-2 rounded"
          />

          <select
            name="cuisine"
            value={form.cuisine}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
          />

          {form.services.map((s, i) => (
            <span key={i} className="inline-block mr-2">
              {s}{" "}
              <button type="button" onClick={() => removeArrayItem("services", i)}>
                ×
              </button>
            </span>
          ))}

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <button
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        <Link to="/owner" className="block text-center mt-4 text-orange-600">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
