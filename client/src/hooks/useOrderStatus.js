export const useOrderStatus = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing Food', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready for Delivery', icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴‍♂️' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  const currentIndex = steps.findIndex(s => s.key === status);

  const progressSteps = steps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    current: index === currentIndex
  }));

  return {
    statusColor: statusColors[status] || 'bg-gray-100 text-gray-800',
    progressSteps
  };
};
