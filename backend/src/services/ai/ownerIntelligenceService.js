const Resource = require('../../models/Resource');
const ResourceRequest = require('../../models/ResourceRequest');
const Booking = require('../../models/Booking');
const Rating = require('../../models/Rating');

const getOwnerIntelligence = async (ownerId) => {
  // 1. Fetch Owner Resources
  const resources = await Resource.find({ owner: ownerId });
  const resourceIds = resources.map(r => r._id);

  if (resources.length === 0) {
    return {
      totalResources: 0,
      activeListings: 0,
      totalRequests: 0,
      totalBookings: 0,
      totalEarnings: 0,
      utilizationRate: 0,
      averageRating: 5.0,
      insights: [
        {
          type: 'TIP',
          message: 'You have not listed any agricultural equipment yet. Add a tractor, pump, or sprayer to start earning sharing revenue.'
        }
      ]
    };
  }

  // 2. Fetch Requests & Bookings metrics
  const requests = await ResourceRequest.find({ owner: ownerId });
  const bookings = await Booking.find({ owner: ownerId });
  const ratings = await Rating.find({ reviewee: ownerId });

  const totalRequests = requests.length;
  const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED').length;
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED').length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

  const totalEarnings = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

  // Utilization metric calculation: days booked / 30 days per resource
  const totalBookedDays = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED' || b.status === 'ACTIVE')
    .reduce((sum, b) => sum + (b.durationDays || 1), 0);

  const potentialDays = Math.max(resources.length * 30, 1);
  const utilizationRate = Math.min(Math.round((totalBookedDays / potentialDays) * 100), 100);

  // Average rating
  const avgRating = ratings.length > 0
    ? Number((ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1))
    : 4.8;

  // Resource breakdown
  const resourceBreakdown = resources.map(res => {
    const resRequests = requests.filter(r => r.resource.toString() === res._id.toString());
    const resBookings = bookings.filter(b => b.resource.toString() === res._id.toString());
    const resRevenue = resBookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    return {
      id: res._id,
      name: res.name,
      category: res.category,
      isAvailable: res.availability.isAvailable,
      verificationStatus: res.verificationStatus,
      requestCount: resRequests.length,
      bookingCount: resBookings.length,
      revenue: resRevenue,
      price: res.pricing.price,
      unit: res.pricing.unit,
      rating: res.ratingSummary?.average || 4.8
    };
  });

  // Sort resources by request popularity
  resourceBreakdown.sort((a, b) => b.requestCount - a.requestCount);

  // Generate Proactive AI Insights
  const insights = [];

  const topResource = resourceBreakdown[0];
  if (topResource && topResource.requestCount > 0) {
    insights.push({
      type: 'DEMAND_ALERT',
      title: 'High Equipment Demand',
      message: `Your "${topResource.name}" is your most requested resource with ${topResource.requestCount} requests. Ensure maintenance is up to date for maximum availability.`
    });
  }

  if (utilizationRate < 30) {
    insights.push({
      type: 'PRICING_TIP',
      title: 'Boost Equipment Utilization',
      message: 'Your current 30-day utilization is below 30%. Consider offering competitive hourly or daily rates or adding seasonal crop tags to attract more local farmers.'
    });
  } else {
    insights.push({
      type: 'SUCCESS',
      title: 'Strong Fleet Utilization',
      message: `Excellent! Your fleet utilization is healthy at ${utilizationRate}%. Continue maintaining prompt request turnaround.`
    });
  }

  const unverifiedCount = resources.filter(r => r.verificationStatus === 'PENDING_VERIFICATION').length;
  if (unverifiedCount > 0) {
    insights.push({
      type: 'ACTION_REQUIRED',
      title: 'Pending Admin Verification',
      message: `You have ${unverifiedCount} resource(s) pending admin verification. Verified listings get 4x more farmer visibility.`
    });
  }

  return {
    success: true,
    overview: {
      totalResources: resources.length,
      availableResources: resources.filter(r => r.availability.isAvailable).length,
      totalRequests,
      acceptedRequests,
      rejectedRequests,
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalEarnings,
      utilizationRate,
      averageRating: avgRating,
      reviewsCount: ratings.length
    },
    resourceBreakdown,
    aiInsights: insights
  };
};

module.exports = {
  getOwnerIntelligence
};
