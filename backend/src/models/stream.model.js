import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    status:{
        type: Boolean,
        default: false
    },
    streamId:{
        type: String,
        default: ""
    },
    thumbnail: {
        type: String,
        required: true
    },
}, {timestamps: true})

export const Stream = mongoose.model("Stream", streamSchema);