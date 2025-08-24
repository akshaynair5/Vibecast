import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId;

    if(!videoId){
        throw new Error("Video ID is required")
    }

    const comments = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "comment",
            as: "allLikes"
            }
        },
        {
            $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                $project: { fullName: 1, avatar: 1, username: 1 }
                }
            ]
            }
        },
        {
            $addFields: {
            ownerDetails: { $first: "$ownerDetails" },
            likesCount: { $size: "$allLikes" },
            hasLiked: {
                $in: [
                new mongoose.Types.ObjectId(req.user._id),
                {
                    $map: {
                    input: "$allLikes",
                    as: "like",
                    in: "$$like.likedBy"
                    }
                }
                ]
            }
            }
        }
    ]);

    if(comments.length === 0){
        throw new ApiError(400,"No comments found for this video")
    }

    res.status(200).json(new ApiResponse(200,"Comments have been fetched successfully", comments))
})

const addComment = asyncHandler(async (req, res)=>{
    const videoId = req.params.videoId;
    const commentText = req.body.comment;

    if(!videoId || !commentText.trim() === ""){
        throw new ApiError(400,"Video ID and comment text are required")
    }

    const comment = await Comment.create({
        content: commentText,
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(500, "Failed to post Comment")
    }

    res.status(200).json(new ApiResponse(200, "Comment has been posted successfully", comment))
})

const deleteComment = asyncHandler(async (req, res)=>{
    const commentId = req.params.commentId;

    if(!commentId){
        throw new ApiError(400,"Comment ID is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    
    res.status(200).json(new ApiResponse(200,"Comment has been deleted successfully", comment))
})

const updateComment = asyncHandler(async (req, res)=>{
    const commentId = req.params.commentId;
    const commentText = req.body.data.comment;

    if(!commentId || !commentText || commentText.trim() === ""){
        throw new ApiError(400,"Comment ID and comment text are required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        content: commentText
    }, {
        new: true
    })

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    res.status(200).json(new ApiResponse(200, "Comment has been updated successfully", comment))
})

export {getVideoComments, addComment, deleteComment, updateComment}