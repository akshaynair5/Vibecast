import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import deleteFromCloudinary from "../utils/fileDelete.js";
import uploadToCloudinary from "../utils/fileUpload.js";
import mongoose from "mongoose";
import { Stream } from "../models/stream.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      query,
      sortBy = "createdAt", // Ensure field name matches schema
      sortType = "desc",
      userId = req.user?._id,
    } = req.body;
  
    console.log(page, limit, query, sortBy, sortType, userId);
  
    // Initialize filters
    const videoFilter = {};
    const userFilter = {};
    const liveStreamFilter = {};
  
    // Add search query filters
    if (query) {
      videoFilter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { topic: { $regex: query, $options: "i" } }
      ];
      userFilter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ];
      liveStreamFilter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }
  
    // Convert sortType to -1 for descending or 1 for ascending
    const sortDirection = sortType === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
  
    try {
      // Execute the queries
      const [videos, totalVideos, users, totalUsers, liveStreams, totalLiveStreams] = await Promise.all([
        Video.find(videoFilter)
          .sort(sortOptions)
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit)),
        Video.countDocuments(videoFilter),
        User.find(userFilter)
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit)),
        User.countDocuments(userFilter),
        Stream.find(liveStreamFilter)
          .sort(sortOptions)
          .skip((page - 1) * parseInt(limit))
          .limit(parseInt(limit)),
        Stream.countDocuments(liveStreamFilter),
      ]);
  
      // Total pages for pagination
      const totalVideoPages = Math.ceil(totalVideos / limit);
      const totalUserPages = Math.ceil(totalUsers / limit);
      const totalLiveStreamPages = Math.ceil(totalLiveStreams / limit);
  
      // Return results
      res.json(
        new ApiResponse(200, "Results retrieved successfully", {
          videos: { data: videos, total: totalVideos, totalPages: totalVideoPages },
          users: { data: users, total: totalUsers, totalPages: totalUserPages },
          liveStreams: { data: liveStreams, total: totalLiveStreams, totalPages: totalLiveStreamPages },
        })
      );
    } catch (error) {
      console.error("Error in getAllVideos:", error);
      throw new ApiError(500, "Internal Server Error", error);
    }
  });  


const publishVideo = asyncHandler(async (req,res)=>{
    const {title, description, topic} = req.body
    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!title ||!description){
        throw new ApiError(400,"Title, Description and Video are required")
    }

    if(!videoLocalPath){
        throw new ApiError(400,"Video has not been uploaded locally")
    }

    const video = await uploadToCloudinary(videoLocalPath)
    if (!video.url) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }
    
    let thumbnail = { url: "" };  // Default if no thumbnail provided
    if (thumbnailLocalPath) {
        thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    }

    if (!thumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }
    

    const newVideo = await Video.create({
        owner: req.user._id,
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url || "",
        isPublished: true,
        duration: video.duration,
        topic
    })

    res.json(new ApiResponse(201, "Video published successfully", newVideo))

})

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = new mongoose.Types.ObjectId(req.params.videoId);

    const pipeline = [
        {
            $match: {
                _id: videoId,
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
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            // Perform a $lookup for the comment owners
            $lookup: {
                from: "users",
                localField: "comments.owner",
                foreignField: "_id",
                as: "commentOwners",
            },
        },
        {
            $addFields: {
                comments: {
                    $map: {
                        input: "$comments",
                        as: "comment",
                        in: {
                            _id: "$$comment._id",
                            content: "$$comment.content",
                            createdAt: "$$comment.createdAt",
                            owner: {
                                _id: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$commentOwners",
                                                        as: "owner",
                                                        cond: { $eq: ["$$owner._id", "$$comment.owner"] },
                                                    },
                                                },
                                                as: "matchedOwner",
                                                in: "$$matchedOwner._id",
                                            },
                                        },
                                        0,
                                    ],
                                },
                                username: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$commentOwners",
                                                        as: "owner",
                                                        cond: { $eq: ["$$owner._id", "$$comment.owner"] },
                                                    },
                                                },
                                                as: "matchedOwner",
                                                in: "$$matchedOwner.username",
                                            },
                                        },
                                        0,
                                    ],
                                },
                                avatar: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$commentOwners",
                                                        as: "owner",
                                                        cond: { $eq: ["$$owner._id", "$$comment.owner"] },
                                                    },
                                                },
                                                as: "matchedOwner",
                                                in: "$$matchedOwner.avatar",
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
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
    ];

    const video = (await Video.aggregate(pipeline))[0];

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.json(new ApiResponse(200, "Video retrieved successfully", video));
});


const deleteVideo = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await deleteFromCloudinary(video.videoFile)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    res.json(new ApiResponse(200, "Video deleted successfully", video))
})

const updateVideo = asyncHandler(async (req,res)=>{ 
    const {title, description} = req.body
    const videoId = req.params.videoId
    const video = await Video.findByIdAndUpdate(videoId, {title, description}, {new: true})

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    res.json(new ApiResponse(200, "Video updated successfully", video))
})

const increaseViews = asyncHandler(async (req, res)=>{
    const videoId = req.params.videoId;
    
    const video = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });
    
    const result = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
                watchHistory: {
                    $each: [videoId],        // Add the new videoId
                    $position: 0            // Insert at the beginning
                }
            }
        },
        { new: true }
    );

    // Trim the watch history to the latest 30 entries
    if (result.watchHistory.length > 30) {
        result.watchHistory = result.watchHistory.slice(0, 30);
        await result.save();
    }

    if(!video){
        throw new ApiError(404,"Video not found");
    }
    res.json(new ApiResponse(200, "Video views updated successfully", video))
})


export {getAllVideos ,publishVideo ,deleteVideo ,updateVideo ,getVideoById, increaseViews}