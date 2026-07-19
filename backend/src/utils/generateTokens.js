import jwt from "jsonwebtoken";

// Short-lived token used to access protected routes
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // e.g. "15m"
  });
};

// Long-lived token used only to get a new access token when it expires
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // e.g. "7d"
  });
};