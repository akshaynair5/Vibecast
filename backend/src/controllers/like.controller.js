import { Like } from "../models/like.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const likeVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    const userId = req.user._id;
  
    if (!videoId || !userId) {
      throw new ApiError(400, "Please provide videoId and userId");
    }
    console.log(videoId, userId)
    try {
      const like = await Like.create({
        likedBy: userId,
        video: videoId,
      });
  
      res.status(200).json(new ApiResponse(200, like, "Video liked successfully"));
    } catch (err) {
        console.log(err)
      if (err.code === 11000) {
        throw new ApiError(400, "You have already liked this video");
      }
      throw new ApiError(500, "Could not like the video");
    }
});
  

const likeComment = asyncHandler(async (req,res)=>{
    const commentId = req.params.videoId;
    const userId = req.user._id;

    if(!videoId || !userId){
        throw new ApiError(400, "Please provide commentId and userId");
    }

    const like = await Like.create({
        likedBy: userId,
        comment: commentId,
    })

    if(!like){
        throw new ApiError(500, "Could not like the Comment");
    }

    res.status(200).json(new ApiResponse(200, like, "Comment liked successfully"))
})

const likeStream = asyncHandler(async (req,res)=>{
    const streamId = req.params.streamId;
    const userId = req.user._id;

    if(!streamId || !userId){
        throw new ApiError(400, "Please provide tweetId and userId");
    }

    const like = await Like.create({
        likedBy: userId,
        stream: streamId,
    })

    if(!like){
        throw new ApiError(500, "Could not like the Tweet");
    }

    res.status(200).json(new ApiResponse(200, like, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(400, "Please provide userId");
    }

    const likes = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            }
        },
        {
            $replaceRoot: {
                newRoot: { $arrayElemAt: ["$videoDetails", 0] }
            }
        }
    ]);

    if (!likes) {
        throw new ApiError(500, "Could not get liked videos");
    }

    res.status(200).json(new ApiResponse(200, likes, "Liked videos retrieved successfully"));
});


const unlike = asyncHandler(async (req,res)=>{
    const likedBy = req.query.likedBy;
    const itemId = req.query.videoId || req.query.commentId || req.query.streamId;
    console.log("unlike", likedBy, itemId)
    console.log(req.body)

    if(!likedBy || !itemId){
        throw new ApiError(400, "Please provide like-ID");
    }
        const unLike = await Like.deleteOne({
            video: itemId,
            likedBy: likedBy,
        });
        if (unLike) {
            console.log("Like entry deleted successfully.");
        } else {
            console.log("No matching like entry found.");
        }

    if(!unLike){
        throw new ApiError(500, "Could not unlike");
    }

    res.status(200).json(new ApiResponse(200, unlike, "un-liked successfully"))
})



export { likeVideo, likeComment, likeStream, getLikedVideos, unlike};