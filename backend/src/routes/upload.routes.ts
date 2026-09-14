import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares';
import { uploadAvatar, upload } from '../middlewares/upload.middleware';

const router = Router();
router.use(authMiddleware);
router.post('/avatar', uploadAvatar.single('file'), UploadController.avatar);
router.post('/file', upload.single('file'), UploadController.file);
export default router;