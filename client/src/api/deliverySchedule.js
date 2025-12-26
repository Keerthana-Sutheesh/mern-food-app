
import api from './api';


export const createDeliverySchedule = async (scheduleData) => {
  const response = await api.post('/delivery-schedules', scheduleData);
  return response;
};


export const getDeliveryScheduleByOrder = async (orderId) => {
  const response = await api.get(`/delivery-schedules/order/${orderId}`);
  return response;
};


export const updateDeliverySchedule = async (scheduleId, updateData) => {
  const response = await api.put(`/delivery-schedules/${scheduleId}`, updateData);
  return response;
};


export const getUpcomingDeliveries = async (params = {}) => {
  const response = await api.get('/delivery-schedules/upcoming', { params });
  return response;
};


export const updateDeliveryStatus = async (scheduleId, status) => {
  const response = await api.put(`/delivery-schedules/${scheduleId}/status`, { status });
  return response;
};


export const assignDeliveryPartner = async (scheduleId, deliveryPartnerId) => {
  const response = await api.put(`/delivery-schedules/${scheduleId}/assign`, {
    deliveryPartnerId
  });
  return response;
};

export const getAvailableTimeSlots = async (date) => {
  const response = await api.get('/delivery-schedules/available-slots', {
    params: { date }
  });
  return response;
};