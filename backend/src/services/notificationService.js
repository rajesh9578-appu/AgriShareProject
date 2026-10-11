const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'SYSTEM',
  data = {}
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      data
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]', error.message);
    return null;
  }
};

const notifyRequestStatusChange = async (request, status) => {
  if (status === 'ACCEPTED') {
    await createNotification({
      recipient: request.farmer,
      sender: request.owner,
      title: 'Resource Request Accepted! 🎉',
      message: `Your request for agricultural equipment has been accepted by the owner. You can now track your confirmed booking.`,
      type: 'REQUEST_ACCEPTED',
      data: { requestId: request._id, resourceId: request.resource, actionUrl: '/farmer/bookings' }
    });
  } else if (status === 'REJECTED') {
    await createNotification({
      recipient: request.farmer,
      sender: request.owner,
      title: 'Resource Request Declined',
      message: `Your request could not be accepted at this time: ${request.rejectionReason || 'Owner is unavailable during the requested dates.'}`,
      type: 'REQUEST_REJECTED',
      data: { requestId: request._id, resourceId: request.resource, actionUrl: '/farmer/requests' }
    });
  }
};

const notifyNewRequest = async (request, resourceName, farmerName) => {
  await createNotification({
    recipient: request.owner,
    sender: request.farmer,
    title: 'New Resource Request Received! 🚜',
    message: `${farmerName} has requested to book your ${resourceName} from ${new Date(request.requiredStartDate).toLocaleDateString()} for ${request.durationDays} day(s).`,
    type: 'REQUEST_RECEIVED',
    data: { requestId: request._id, resourceId: request.resource, actionUrl: '/owner/requests' }
  });
};

const notifyBookingConfirmed = async (booking, resourceName) => {
  await createNotification({
    recipient: booking.farmer,
    title: `Booking Confirmed: ${booking.bookingReference}`,
    message: `Your booking for ${resourceName} is confirmed for ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}.`,
    type: 'BOOKING_CONFIRMED',
    data: { bookingId: booking._id, resourceId: booking.resource, actionUrl: '/farmer/bookings' }
  });
};

const notifyBookingCompleted = async (booking, resourceName) => {
  await createNotification({
    recipient: booking.farmer,
    title: `Booking Completed - Leave a Review ⭐`,
    message: `Your rental period for ${resourceName} is marked complete. Please share your rating and experience to help fellow farmers.`,
    type: 'BOOKING_COMPLETED',
    data: { bookingId: booking._id, resourceId: booking.resource, actionUrl: '/farmer/bookings' }
  });
};

module.exports = {
  createNotification,
  notifyRequestStatusChange,
  notifyNewRequest,
  notifyBookingConfirmed,
  notifyBookingCompleted
};
