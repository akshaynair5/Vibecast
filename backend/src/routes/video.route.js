import {Router} from 'express'
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideo, increaseViews} from '../controllers/video.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/").post(verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount:1
        },
        {
            name: "thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
)

router.route("/search").post(verifyJWT, getAllVideos)

router.route("/:videoId").get(verifyJWT,getVideoById).patch(verifyJWT, updateVideo).delete(verifyJWT, deleteVideo)
router.route("/:videoId/views").post(verifyJWT, increaseViews)

export default router