import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createStream, getStream, deleteStream, addViewer ,getAllStreams, getStreamsByUser, setStreamId, stopStream, updateStream, removeViewer} from '../controllers/stream.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/').get(getAllStreams).post(
    upload.single('thumbnail'),
    createStream
);

router.route('/:streamId/add-viewer').patch(addViewer)
router.route('/:streamId/remove-viewer').patch(removeViewer)

router.route('/:streamId').get(getStream).delete(deleteStream).patch(stopStream);

router.route('/:streamId/update').patch(updateStream);

router.route('/user/:userId').get(getStreamsByUser);

router.route('/:id/set-stream-id').patch(setStreamId);

export default router;