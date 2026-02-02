const { default: mongoose } = require("mongoose");

let cached = global.mongoseConn;
if(!cached) {
    cached = global.mongoseConn = { conn: null, promise: null }
}
// Connect
async function connectDB() {
    if(cached.conn) {
        return cached.conn;
    }
    if(!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGOURI).then((mongoose) => {
            return mongoose
        })
    }
    cached.conn = await cached.promise;
    console.log("DB OK")
    return cached.conn;
}

export default connectDB;