import jwt from "jsonwebtoken";

const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    socket.userId = decoded.userId || decoded.id || decoded._id;
    socket.userEmail = decoded.email;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication failed: " + error.message));
  }
};

export default socketAuthMiddleware;
