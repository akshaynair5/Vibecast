import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getSubscribedChannels = asyncHandler(async (req,res)=>{
    const channelId = req.params.channelId;

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo",
                pipeline: [  // Here, we define the lookup pipeline to select specific fields
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribedToCount: { $size: "$subscribedTo" }
            }
        }
    ]);

    if(channels.length === 0){
        throw new ApiError(400,"No subscriptions found for this channel");
    }

    res.status(200).json(new ApiResponse(200, channels,"Subscriptions found successfully"))
})

const toggleSubscription = asyncHandler(async (req,res)=>{
    const channelId = req.params.channelId;
    
    if(!channelId){
        throw new ApiError(400,"Channel Id is required");
    }

    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    });

    if(!subscription){
        throw new ApiError(400,"Failed to subscribe to channel");
    }

    res.status(201).json(new ApiResponse(201, subscription,"Subscription created successfully"))
})

const unSubscribe = asyncHandler(async (req,res)=>{
    const channelId = req.params.channelId;

    if(!channelId){
        throw new ApiError(400,"Channel Id is required");
    }

    const subscription = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: req.user._id
    });

    if(!subscription){
        throw new ApiError(400,"Failed to unsubscribe from channel");
    }

    res.status(200).json(new ApiResponse(200, subscription,"Subscription deleted successfully"))
})

const getUserSubscriptions = asyncHandler(async (req, res) => {
    const userDetailsList = await Subscription.aggregate([
        {
            $match: {
                subscriber: req.user._id, // Match the current user's subscriptions
            }
        },
        {
            $lookup: {
                from: "users", // The name of the users collection
                localField: "channel", // Field in the Subscription collection
                foreignField: "_id", // Field in the Users collection
                as: "userDetails", // Alias for the joined user details
            }
        },
        {
            $unwind: "$userDetails" // Flatten the user details array to a single object
        },
        {
            $project: {
                _id: 0, // Exclude the subscription document ID
                "userDetails._id": 1,
                "userDetails.fullName": 1, // Include the user details you want
                "userDetails.email": 1, 
                "userDetails.avatar": 1, // Example: Add user avatar if required
                "userDetails.username": 1,
            }
        },
        {
            $replaceRoot: { newRoot: "$userDetails" } // Replace the root with userDetails
        }
    ]);

    if (!userDetailsList || userDetailsList.length === 0) {
        throw new ApiError(400, "No subscriptions found for this user");
    }

    res.status(200).json(new ApiResponse(200, userDetailsList, "Subscriptions found successfully"));
});


export { getSubscribedChannels, toggleSubscription, unSubscribe, getUserSubscriptions }