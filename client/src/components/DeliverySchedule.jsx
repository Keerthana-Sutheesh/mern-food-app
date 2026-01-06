import { useState, useEffect } from 'react';
import { getDeliveryScheduleByOrder, updateDeliverySchedule } from '../api/deliverySchedule';

const DeliverySchedule = ({ orderId, canEdit = false }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    deliveryType: 'instant',
    scheduledDate: '',
    timeSlot: '',
    deliveryNotes: ''
  });

  useEffect(() => {
    loadSchedule();
  }, [orderId]);

  const loadSchedule = async () => {
    try {
      const response = await getDeliveryScheduleByOrder(orderId);
      setSchedule(response.data);
      setEditData({
        deliveryType: response.data.deliveryType,
        scheduledDate: response.data.scheduledDate ? new Date(response.data.scheduledDate).toISOString().split('T')[0] : '',
        timeSlot: response.data.timeSlot || '',
        deliveryNotes: response.data.deliveryNotes || ''
      });
    } catch (error) {
      console.error('Failed to load delivery schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDeliverySchedule(schedule._id, editData);
      setEditing(false);
      loadSchedule();
    } catch (error) {
      console.error('Failed to update delivery schedule:', error);
      alert('Failed to update delivery schedule');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading delivery schedule...</div>;
  }

  if (!schedule) {
    return <div className="text-center py-4 text-gray-500">No delivery schedule found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      picked_up: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Schedule</h3>
        {canEdit && schedule.status === 'pending' && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium capitalize">{schedule.deliveryType}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
            {schedule.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {schedule.deliveryType === 'scheduled' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scheduled Date:</span>
              <span className="font-medium">
                {schedule.scheduledDate ? new Date(schedule.scheduledDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time Slot:</span>
              <span className="font-medium">{schedule.timeSlot || 'N/A'}</span>
            </div>
          </>
        )}

        {schedule.deliveryNotes && (
          <div>
            <span className="text-gray-600 block mb-1">Delivery Notes:</span>
            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{schedule.deliveryNotes}</p>
          </div>
        )}

        {schedule.deliveryPartner && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Delivery Partner:</span>
            <span className="font-medium">{schedule.deliveryPartner.name}</span>
          </div>
        )}

        {schedule.estimatedDeliveryTime && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estimated Delivery:</span>
            <span className="font-medium">
              {new Date(schedule.estimatedDeliveryTime).toLocaleString()}
            </span>
          </div>
        )}

        {schedule.actualDeliveryTime && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Actual Delivery:</span>
            <span className="font-medium">
              {new Date(schedule.actualDeliveryTime).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Type
              </label>
              <select
                value={editData.deliveryType}
                onChange={(e) => setEditData({...editData, deliveryType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="instant">Instant Delivery</option>
                <option value="scheduled">Scheduled Delivery</option>
              </select>
            </div>

            {editData.deliveryType === 'scheduled' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editData.scheduledDate}
                    onChange={(e) => setEditData({...editData, scheduledDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={editData.timeSlot}
                    onChange={(e) => setEditData({...editData, timeSlot: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select time slot</option>
                    <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                    <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                    <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                    <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                    <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                    <option value="5:00 PM - 6:00 PM">5:00 PM - 6:00 PM</option>
                    <option value="6:00 PM - 7:00 PM">6:00 PM - 7:00 PM</option>
                    <option value="7:00 PM - 8:00 PM">7:00 PM - 8:00 PM</option>
                    <option value="8:00 PM - 9:00 PM">8:00 PM - 9:00 PM</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Notes
              </label>
              <textarea
                value={editData.deliveryNotes}
                onChange={(e) => setEditData({...editData, deliveryNotes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                rows="2"
                placeholder="Any special instructions..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySchedule;