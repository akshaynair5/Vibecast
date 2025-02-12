import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(express.json({limit:'16kb'}))
app.use(urlencoded({limit:'16kb',extended:true}))
app.use(cookieParser())                     // This basically allows us to access the JWT Tokens through the requests of the user. 
app.use(express.static('public'))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Routes

import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.route.js";
import healthCheckRouter from "./routes/healthcheck.route.js";
import likeRouter from "./routes/like.route.js";
import playlistRouter from "./routes/playlist.route.js";
import subscriptionsRouter from "./routes/subscription.route.js";
import tweetRouter from "./routes/tweet.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import videoRouter from "./routes/video.route.js"
import streamRouter from "./routes/stream.route.js"

app.use("/api/v1/users",userRouter)

app.use("/api/v1/comments",commentRouter)

app.use("/api/v1/health-check",healthCheckRouter)

app.use("/api/v1/like", likeRouter)

app.use("/api/v1/playlist", playlistRouter)

app.use("/api/v1/subscriptions", subscriptionsRouter)

app.use("/api/v1/tweets", tweetRouter)

app.use("/api/v1/dashboard", dashboardRouter)

app.use("/api/v1/video", videoRouter)

app.use("/api/v1/stream", streamRouter)

export {app};