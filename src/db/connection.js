import mongoose from "mongoose";

export default async function connectedDb() {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log("Connected to db");
    } catch (error) {
        console.log(error.message);
    }
}