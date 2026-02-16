import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let cached = global.mongoseConn;
if (!cached) {
  cached = global.mongoseConn = { conn: null, promise: null };
}
// Connect
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  console.log("DB OK");
  return cached.conn;
}

export default connectDB;
