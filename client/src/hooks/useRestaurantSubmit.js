import { createRestaurant, updateRestaurant } from "../api/restaurant";

export function useRestaurantSubmit(navigate) {
  const submitRestaurant = async ({
    form,
    existingRestaurant,
    setError,
    setSuccess,
    setLoading,
  }) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = existingRestaurant
        ? await updateRestaurant(form)
        : await createRestaurant(form);

      setSuccess(res.data.message);
      setTimeout(() => navigate("/owner"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return submitRestaurant;
}
