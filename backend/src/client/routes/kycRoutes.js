// backend/src/routes/kycRoutes.js
const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/kycController');
const { protect } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

router.use(protect);

router.get('/documents', getDocuments);
router.post('/upload', upload.single('document'), uploadDocument);
router.delete('/documents/:id', deleteDocument);

module.exports = router;
