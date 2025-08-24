import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/fileUpload.js";
import ApiError from "../utils/apiError.js";
import deleteFromCloudinary from "../utils/fileDelete.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Stream } from "../models/stream.model.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async (userId) =>{
    try{
        const user = await User.findById(userId) 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})                      // As password field is not present here we should not validate it
        
        return {refreshToken, accessToken}        
    }
    catch(err){
        console.log(err)
        throw new ApiError(500,"Something went wrong during token generation")
    }
}

const googleLogin = asyncHandler(async (req, res) => {
    try {
        const token = req.body.token;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const { name, email, picture, sub, email_verified } = ticket.getPayload();

        if (!email_verified) {
            throw new ApiError(401, "Google account not verified");
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Extract first name (fallback if full name is missing)
            let baseUsername = name ? name.split(" ")[0].toLowerCase() : "user";
            baseUsername = baseUsername.replace(/[^a-z0-9]/gi, ""); // remove spaces/special chars

            let username = baseUsername;
            let counter = 1;

            // Ensure username is unique
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            // Create new user
            user = await User.create({
                googleId: sub,
                email,
                fullName: name,
                avatar: picture,
                username
            });
        }
        
        const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                user: loggedInUser,
            }));

    } catch (error) {
        console.error("Google login error:", error);
        throw new ApiError(401, error.message || "Invalid token");
    }
});

const registerUser = asyncHandler(async (req,res) => {
    // Get details from request
    // validate details from user
    // check for files
    // upload file and retrieve URL 
    // create user object and add object as db entry
    // receive response from db 
    // remove password and refresh token from response
    // check for user creation confirmation
    // return response to client

    const {fullName,email,password,username} = req.body

    if([fullName,email,password,username].some(field => field.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser){
        throw new ApiError(409,"User with the same username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path                                // Here avatar is the name of the file type given in user.routes
    let coverImageLocalPath
    // The above req.files if printed will give us an array of objects consisting of info like originalname, encoding, mimetype, destination, 
    // filename, path, size, etc.

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is Required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong during user registration")
    }

    return res.status(201).json(new ApiResponse(200,createdUser,"User registered successfully"))
});

const loginUser = asyncHandler(async (req,res)=>{
    // Get details from request
    // username or email should be there and valid along with password
    //find the user in db
    // check if password is correct
    // generate refresh token and access token
    // return refresh and access token as secure cookie

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }

    const userExists = await User.findOne({
        $or: [{username},{email}]
    })

    if(!userExists){
        throw new ApiError(401,"username or email does not exist")
    }

    const isPasswordValid = await userExists.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect password")
    }   

    const {refreshToken,accessToken} = await generateAccessAndRefreshTokens(userExists._id)

    const loggedInUser = await User.findById(userExists._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,                 // What this does is that the cookies we create are now modifiable only by the server and not the browser itself.
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user: loggedInUser,
    }))
});

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.body._id,{
            $unset: {refreshToken: 1}                 // Removes the refresh token from the user object
        },
        {
            new: true                                   // This tells the method to return the updated document value instead of the original one.
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,"User logged out successfully"))
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken  = req.cookies.refreshToken ||  req.body.refreshToken
    console.log(incomingRefreshToken)

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh Token not Available")
    }

    const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    if(!decodedToken){
        throw new ApiError(401,"Invalid Token")
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    console.log(user)
    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401,"Invalid Token")
    }
    const {refreshToken,accessToken} = await generateAccessAndRefreshTokens(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    // await user.save({validateBeforeSave: false},{
    //     refreshToken:refreshToken
    // })
    
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{
        user,
        accessToken,
        refreshToken
    }))
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {currentPassword, newPassword} = req.body

    if(!currentPassword || !newPassword){
        throw new ApiError(400,"New Password and Previous Password is required")
    }

    const user  = await User.findById(req.user?._id)
    if(!(await user.isPasswordCorrect(currentPassword))){
        throw new ApiError(401,"Incorrect Password")
    }

    user.password = newPassword  // We do not need to hash the password as we have built a pre function that would hash the values automatically before saving to the db.
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"));

})

const getCurrentUser = asyncHandler(async (req,res)=>{
    console.log(req.user)
    res.status(200).json(new ApiResponse(200,req.user,"User has been fetched successfully"))
})

const checkUserNameAvailability = asyncHandler(async (req, res) =>{
    const { username } = req.body;
    console.log(req.body)
    if(!username){
        throw new ApiError(400,"Username is required")
    }
    
    const user = await User.findOne({username: username.toLowerCase()});

    if(user){
        return res.status(200).json(new ApiResponse(200, "Username is already taken", {isAvailable: false}))
    }
    else{
        return res.status(200).json(new ApiResponse(200, "Username is available", {isAvailable: true}))
    }
})

const updateUserDetails = asyncHandler(async (req,res)=>{
    const {fullName, description, username, email} = req.body;

    if(!(fullName || email || description || username)){
        throw new ApiError(400,"Full Name or Email is required")
    }

    const emailExists = await User.findOne({email})
    if(emailExists && emailExists._id.toString() !== req.user?._id.toString()){
        throw new ApiError(409,"Email already exists");
    }

    // const user = req.user;
    // user.fullName = fullName;
    // user.email = email;

    // await user.save({validateBeforeSave:false});

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email,
                description,
                username: username?.toLowerCase()
            }   
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"User information has been uploaded successfully"))

})

const updateAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path;
    const prevAvatar = req.user.avatar

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar")
    }

    await deleteFromCloudinary(prevAvatar, 'image')
    // user.avatar = avatar.url;
    // await user.save({validateBeforeSave:false});

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"Avatar has been uploaded successfully"))

})

const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path;
    const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");
    const prevCoverImage = req.user.coverImage

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image is required")
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading Cover Image")
    }

    await deleteFromCloudinary(prevCoverImage, 'image');

    // user.avatar = avatar.url;
    // await user.save({validateBeforeSave:false});

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"Cover Image has been uploaded successfully"))

})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const channelUserId = req.params.username;
    if(!channelUserId){
        throw new ApiError(400,"Username is required")
    }
    console.log(channelUserId)

    const channel = await User.aggregate(
        [
            {
                $match:{
                    username: channelUserId.toLowerCase()                       // This fetches the user details of the channel from Users collection
                }
            },
            {
                $lookup: {                        // This joins the subscriptions collection with the users collection to get the list of subscribers and subscribed channels
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {                         // This does the same but with different conditions
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribedTo"
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videos"
                }
            },
            {
                $lookup: {
                    from: "streams",
                    localField: "_id",
                    foreignField: "owner",
                    as: "liveStreams"
                }
            },
            {
                $addFields: {                      // Adds new fields with the data that we would have from previous pipeline stages (Key-Value Pair)
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    isSubscribed: {
                        $cond: {                          // This checks if the current user is already subscribed to the channel or not
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {                       // From the data received from previous pipeline stages we decide which fields to show to the client
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    isSubscribed: 1,
                    email:1,
                    videos: 1,
                    liveStreams: 1
                }
            }
        ]
    )
    if(!channel.length > 1){
        throw new ApiError(400,"Channel does not exist")
    }
    console.log(channel)
    res.status(200).json(new ApiResponse(200,channel,"Channel has been retrieved successfully"))

})

const getWatchHistory = asyncHandler(async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory", // Collect all the videos in the user's watchHistory array
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users", // Collect the owner details of the video
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: { $first: "$owner" } // Reduce the owner array to a single object
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    watchHistory: 1 // Only return the watchHistory field
                }
            }
        ]);

        if (!user || !user[0]) {
            return res.status(404).json(new ApiResponse(404, null, "User not found"));
        }

        res.status(200).json(
            new ApiResponse(200, user[0].watchHistory, "Watch history has been retrieved successfully")
        );
    } catch (error) {
        console.error("Error retrieving watch history:", error);
        res.status(500).json(new ApiResponse(500, null, "An error occurred while retrieving watch history"));
    }
});


const userContent = asyncHandler(async (req, res) => {
    try {
      const userId = req.user._id; // Assuming user ID is available in the request
  
      // Fetch subscriptions for the user
      const subscriptions = await Subscription.find({ subscriber: userId }).populate('channel');
  
      // Fetch videos from subscribed channels
      const subscribedChannels = subscriptions.map((sub) => sub.channel._id);
      const forYouVideos = await Video.find({ owner: { $in: subscribedChannels }, isPublished: true })
        .sort({ createdAt: -1 }) // Most recent first
        .limit(10);
  
      // Fetch trending or latest videos for Explore
      const exploreVideos = await Video.find({
        isPublished: true,
        owner: { $ne: req.user._id }, // Exclude videos uploaded by the current user
      })
        .sort({ views: -1 }) // Sort by views in descending order (trending videos)
        .limit(10);
  
      // Fetch trending live streams
      const liveStreams = await Stream.find({
        status: true,
        owner: { $ne: req.user._id }, // Exclude videos uploaded by the current user
      })
        .sort({ views: -1 }) // Sort by views in descending order (trending videos)
        .limit(10);
  
      // Group videos by topics
      const topicVideos = await Video.aggregate([
        {
          $match: {
            isPublished: true,
          },
        },
        {
          $group: {
            _id: "$topic", // Group by the 'topic' field
            videos: {
              $push: {
                _id: "$_id",
                title: "$title",
                description: "$description",
                thumbnail: "$thumbnail",
                owner: "$owner",
                createdAt: "$createdAt",
                views: "$views",
                duration: "$duration",
              },
            },
          },
        },
        {
          $sort: { _id: 1 }, // Sort groups alphabetically by topic
        },
      ]);
  
      res.status(200).json({
        forYou: forYouVideos,
        explore: exploreVideos,
        liveStreams: liveStreams,
        topics: topicVideos,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching home page data", error });
    }
});  

const clearHistory = asyncHandler(async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                watchHistory: []
            }
        }, {
            new: true
        });

        if (!user) {
            return res.json(new ApiResponse(404, null, "User not found"));
        }

        res.json(new ApiResponse(200, user, "Watch history has been cleared successfully"));
    } catch (error) {
        console.error("Error clearing watch history:", error);
        res.json(new ApiResponse(500, null, "An error occurred while clearing watch history"));
    }
});

export {googleLogin, registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, checkUserNameAvailability, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory, userContent, clearHistory};