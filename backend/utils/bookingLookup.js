import mongoose from "mongoose";
import BookedRide from "../DB/Schema/BookedRideSchema.js";

export const buildBookingQuery = (bookingId) => {
  if (mongoose.Types.ObjectId.isValid(bookingId)) {
    return { $or: [{ _id: bookingId }, { bookingCode: bookingId }] };
  }
  return { bookingCode: bookingId };
};

export const findBookingByIdOrCode = (bookingId, populate) => {
  const query = buildBookingQuery(bookingId);
  let dbQuery = BookedRide.findOne(query);
  if (populate) {
    dbQuery = dbQuery.populate(populate);
  }
  return dbQuery;
};
