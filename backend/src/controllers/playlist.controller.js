import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlayList = asyncHandler(async (req, res)=>{
    const { name, description } = req.body;
    if(!name || !description){
        throw new ApiError(400, "Please provide name and description for the playlist");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500,"Playlist not created")
    }

    res.status(200).json(new ApiResponse(200,playlist,"Playlist created successfully"))

})

const getPlayList = asyncHandler(async (req,res)=>{
    const playListId = req.params.playListId;

    if(!playListId){
        throw new ApiError(400,"Please provide playListId")
    }

    const playList = await Playlist.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(playListId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videosList",
                foreignField: "_id",
                as: "videoList",
                
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }, 
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    },
                    {
                        $addFields:{
                            $first: "$owner"
                        }
                    }
                ]
            }
        }
    ])

    res.status(200).json(new ApiResponse(200,playList,"Playlist fetched successfully"))
})

const updatePlayListDetails = asyncHandler(async (req,res)=>{
    const playListId = req.params.playListId;
    const name = req.body.name
    const description = req.body.description

    if(!playListId){
        throw new ApiError(400,"Please provide playListId")
    }

    if (!name && !description) {
        throw new ApiError(400, "Please provide name or description for the playlist");
    }
    
    const updateFields = {};  // Create an empty object to hold the fields to update
    
    if (name) {
        updateFields.name = name;  // If name is provided, add it to updateFields
    }
    
    if (description) {
        updateFields.description = description;  // If description is provided, add it to updateFields
    }
    
    const playlist = await Playlist.findByIdAndUpdate(playListId, updateFields, {
        new: true
    }); 

    if(!playlist){
        throw new ApiError(500,"Playlist not updated")
    }

    res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))
})

const deletePlayList = asyncHandler(async (req,res)=>{
    const playListId = req.params.playListId;

    if(!playListId){
        throw new ApiError(400,"Please provide playListId")
    }

    const playlist = await Playlist.findByIdAndDelete(playListId);

    if(!playlist){
        throw new ApiError(500,"Playlist not deleted")
    }

    res.status(200).json(new ApiResponse(200,playlist,"Playlist deleted successfully"))
})

const addVideoToPlayList = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId;
    const playListId = req.params.playListId;

    if(!videoId || !playListId){
        throw new ApiError(400,"VideoId and playListId are required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const playList = await Playlist.findByIdAndUpdate(playListId,{
        $addToSet:{
            videosList: videoId
        }
    },{
        new: true
    })

    if(!playList){
        throw new ApiError(500,"Video could not be added to playlist")
    }

    res.status(200).json(new ApiResponse(200,playList,"Video added to playlist successfully"))
})

const removeVideoFromPlayList = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId;
    const playListId = req.params.playListId;

    if(!videoId || !playListId){
        throw new ApiError(400,"VideoId and playListId are required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const playList = await Playlist.findByIdAndUpdate(playListId, 
        {
            $pull: {
                videosList: videoId  // Removes the videoId from the videosList array
            }
        }, 
        {
            new: true  // Returns the updated playlist after the removal
        }
    );

    if(!playList){
        throw new ApiError(500,"Video could not be removed from playlist")
    }

    res.status(200).json(new ApiResponse(200,playList,"Video removed from playlist successfully"))
})

const getUserPlaylists = asyncHandler(async (req,res)=>{
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid userId format");
    }
    
    // const playLists = await Playlist.find({owner: userId})
    const playLists = await Playlist.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                let: { videosList: "$videosList" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$videosList"]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { ownerId: "$owner" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$ownerId"]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ],
                            as: "owner"
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] } // Extract the first user document
                        }
                    }
                ],
                as: "videoList"
            }
        }
    ]);
    

    // if(playLists.length === 0){
    //     throw new ApiError(404,"No playlists found for the user")
    // }

    res.status(200).json(new ApiResponse(200,playLists,"Playlists fetched successfully"))

    // {
    //     "success": true,
    //     "message": [
    //         {
    //             "_id": "6778ff5b2f4e070e10f149d7",
    //             "owner": "67698c2cccd6e1c25ac9276f",
    //             "videosList": [
    //                 "6777ade58a1df574c804aa44"
    //             ],
    //             "name": "News Playlist",
    //             "description": "New Orleans attack updates.",
    //             "createdAt": "2025-01-04T09:28:59.088Z",
    //             "updatedAt": "2025-01-04T09:41:36.033Z",
    //             "__v": 0,
    //             "videoList": [
    //                 {
    //                     "_id": "6777ade58a1df574c804aa44",
    //                     "videoFile": "http://res.cloudinary.com/dlipeltnv/video/upload/v1735896546/hkpdhcnmovycvyvubrf2.mp3",
    //                     "thumbnail": "http://res.cloudinary.com/dlipeltnv/image/upload/v1735896548/gwqrxqamjk5pp6t7bwq4.jpg",
    //                     "title": "New Orleans attack: death toll rises to 15",
    //                     "description": "US authorities say they do not believe the man who rammed his truck into New Year revellers acted alone. Also: a Tesla Cybertruck explodes outside Trump Tower in Las Vegas, and the shipping forecast celebrates 100 years.",
    //                     "duration": 2011.324082,
    //                     "views": 0,
    //                     "isPublished": true,
    //                     "owner": {
    //                         "_id": "6777aaf78a1df574c804aa25",
    //                         "username": "user1",
    //                         "fullName": "User 1",
    //                         "avatar": "http://res.cloudinary.com/dlipeltnv/image/upload/v1735895797/pnm10qgoamidrze3v6cd.png"
    //                     },
    //                     "__v": 0
    //                 }
    //             ]
    //         },
    //         {
    //             "_id": "677900852f4e070e10f14a5b",
    //             "owner": "67698c2cccd6e1c25ac9276f",
    //             "videosList": [],
    //             "name": "News Playlist 2",
    //             "description": "Additional important news",
    //             "createdAt": "2025-01-04T09:33:57.237Z",
    //             "updatedAt": "2025-01-04T09:33:57.237Z",
    //             "__v": 0,
    //             "videoList": []
    //         }
    //     ],
    //     "data": "Playlists fetched successfully",
    //     "statusCode": 200
    // }

})

export {createPlayList ,getPlayList ,updatePlayListDetails, deletePlayList, addVideoToPlayList, removeVideoFromPlayList, getUserPlaylists}