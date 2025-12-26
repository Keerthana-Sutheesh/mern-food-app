// api/feedback.js
import api from './api';

// Submit comprehensive feedback
export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/feedbacks', feedbackData);
  return response;
};


export const getOrderFeedback = async (orderId) => {
  const response = await api.get(`/feedbacks/order/${orderId}`);
  return response;
};


export const getRestaurantFeedback = async (restaurantId, params = {}) => {
  const response = await api.get(`/feedbacks/restaurant/${restaurantId}`, { params });
  return response;
};


export const respondToFeedback = async (feedbackId, comment) => {
  const response = await api.put(`/feedbacks/${feedbackId}/response`, { comment });
  return response;
};


export const markFeedbackHelpful = async (feedbackId) => {
  const response = await api.put(`/feedbacks/${feedbackId}/helpful`);
  return response;
};


export const reportFeedback = async (feedbackId, reason) => {
  const response = await api.put(`/feedbacks/${feedbackId}/report`, { reason });
  return response;
};


export const getPendingModeration = async (params = {}) => {
  const response = await api.get('/feedbacks/moderation/pending', { params });
  return response;
};

export const moderateFeedback = async (feedbackId, status, reason) => {
  const response = await api.put(`/feedbacks/${feedbackId}/moderate`, {
    status,
    moderationReason: reason
  });
  return response;
};


export const getFeedbackStats = async () => {
  const response = await api.get('/feedbacks/stats');
  return response;
};