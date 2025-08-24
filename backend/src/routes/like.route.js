import { Router } from 'express';
import {
    likeVideo,
    likeComment,
    likeStream,
    getLikedVideos,
    unlike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(likeVideo);
router.route("/toggle/c/:commentId").post(likeComment);
router.route("/toggle/s/:streamId").post(likeStream);
router.route("/videos").get(getLikedVideos);
router.route("/toggleDislike").delete(unlike);

export default router;