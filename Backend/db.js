import mongoose from "mongoose";

const mongoURI = 'mongodb://127.0.0.1:27017/prreview?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false';

const connectToMongo = () => {
    mongoose.connect(mongoURI);
}

const tokenSchema = new mongoose.Schema({
    access_token: String,
    token_type: String,
    scope: String,
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export const Token = mongoose.model('token', tokenSchema);
export default connectToMongo;
