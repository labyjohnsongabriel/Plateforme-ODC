// src/routes/upload.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { RoleName } from '../entities/enums';
import { uploadImage, uploadDocument } from '../middlewares/upload.middleware';
import { UploadController } from '../controllers/upload.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([
  RoleName.STAFF_ODC,
  RoleName.FORMATEUR,
  RoleName.ADMINISTRATEUR,
]));

// POST /api/uploads/image    → upload image simple
router.post('/image',    uploadImage.single('fichier'),    UploadController.uploadImage);
// POST /api/uploads/images   → upload multiple
router.post('/images',   uploadImage.array('fichiers', 5), UploadController.uploadImages);
// POST /api/uploads/document → upload PDF / doc / vidéo
router.post('/document', uploadDocument.single('fichier'), UploadController.uploadDocument);
// DELETE /api/uploads/:filename
router.delete('/:filename', UploadController.deleteFile);

export default router;