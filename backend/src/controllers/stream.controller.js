import { Stream } from '../models/stream.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';
import uploadToCloudinary from '../utils/fileUpload.js';
import ApiError from '../utils/ApiError.js';

const createStream = asyncHandler(async (req, res) => {
    const { title, description, streamId } = req.body;
    const thumbnailLocalPath = req.file?.path
    const owner = req.user._id;
    let thumbnail = { url: "" };  // Default if no thumbnail provided
    if (thumbnailLocalPath) {
        thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    }

    if (!thumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }
    const stream = new Stream({ title, description, streamId, owner, thumbnail: thumbnail.url});
    const savedStream = await stream.save();
    const response = new ApiResponse(200, 'Stream created successfully', savedStream);
    return res.json(response);
});

const getStream = asyncHandler(async (req, res) => {
    const streamId = new mongoose.Types.ObjectId(req.params.streamId);

    const pipeline = [
        {
            $match: {
                _id: streamId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "stream",
                as: "likes",
            },
        },
        {
            $addFields: {
                isLiked: {
                    $in: [req.user._id, "$likes.likedBy"], // Check if the user has liked
                },
                likeCount: {
                    $size: "$likes", // Count the number of likes
                },
            },
        },
        {
            $project: {
                description: 1,
                title: 1,
                streamId: 1,
                thumbnail: 1,
                ownerInfo: {
                    _id: 1,
                    fullName: 1,
                    avatar: 1,
                    username: 1
                },
                comments: 1,
                likeCount: 1,
                isLiked: 1,
            },
        },
    ]

    const stream = (await Stream.aggregate(pipeline))[0];
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.status(response.statusCode).json(response);
    }
    const response = new ApiResponse(200, 'Stream found', stream);
    return res.json(response);
});

const getAllStreams = asyncHandler(async (req, res) => {
    const streams = await Stream.find();
    const response = new ApiResponse(200, 'Streams found', streams);
    return res.json(response);
});

const updateStream = asyncHandler(async (req, res) => {
    const streamId = req.params.streamId;
    const { title, description } = req.body;
    const stream = await Stream.findById(streamId);
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.json(response);
    }
    if (stream.owner.toString() !== req.user._id.toString()) {
        const response = new ApiResponse(401, 'Not authorized to update this stream');
        return res.json(response);
    }
    stream.title = title;
    stream.description = description;
    const updatedStream = await stream.save();
    const response = new ApiResponse(200, 'Stream updated successfully', updatedStream);
    return res.json(response);
});

const setStreamId = asyncHandler(async (req, res) => {
    const streamId = req.body.streamId;
    const id = req.params.id
    
    const stream = await Stream.findById(id);
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.json(response);
    }
    // if (stream.owner.toString() !== req.user._id.toString()) {
    //     const response = new ApiResponse(401, 'Not authorized to update this stream');
    //     return res.json(response);
    // }

    stream.streamId = streamId
    stream.status = true
    const updatedStream = await stream.save();
    const response = new ApiResponse(200, 'Stream updated successfully', updatedStream);

    return res.json(response);
});

const stopStream = asyncHandler(async (req, res) => {
    const streamId = req.params.streamId;
    const stream = await Stream.findById(streamId);
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.json(response);
    }
    if (stream.owner.toString() !== req.user._id.toString()) {
        const response = new ApiResponse(401, 'Not authorized to update this stream');
        return res.json(response);
    }

    stream.status = false
    stream.streamId = ""
    const updatedStream = await stream.save();
    const response = new ApiResponse(200, 'Stream updated successfully', updatedStream);

    return res.json(response);
});

const deleteStream = asyncHandler(async (req, res) => {
    const streamId = req.params.streamId;
    const stream = await Stream.findById(streamId);
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.json(response);
    }
    if (stream.owner.toString() !== req.user._id.toString()) {
        const response = new ApiResponse(401, 'Not authorized to delete this stream');
        return res.json(response);
    }
    await stream.remove();
    const response = new ApiResponse(200, 'Stream deleted successfully');
    return res.json(response);
});

const addViewer = asyncHandler(async (req, res) => {
    const streamId = req.params.streamId;
    const stream = await Stream.findById(streamId);
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.json(response);
    }
    stream.views += 1;
    const updatedStream = await stream.save();
    const response = new ApiResponse(200, 'Stream viewed successfully', updatedStream);
    return res.json(response);
});

const removeViewer =asyncHandler(async (req, res) => {
    const streamId = req.params.streamId;
    const stream = await Stream.findById(streamId);
    if (!stream) {
        const response = new ApiResponse(404, 'Stream not found');
        return res.json(response);
    }
    stream.views -= 1;
    const updatedStream = await stream.save();
    const response = new ApiResponse(200, 'Stream viewed successfully', updatedStream);
    return res.json(response);
});

const getStreamsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const streams = await Stream.find({ owner: userId });
    const response = new ApiResponse(200, 'Streams found', streams);
    return res.json(response);
});

export { createStream, getStream, getAllStreams, updateStream, deleteStream, addViewer, getStreamsByUser, setStreamId, stopStream, removeViewer };