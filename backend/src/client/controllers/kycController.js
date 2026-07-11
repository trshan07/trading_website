// backend/src/controllers/kycController.js
const KyCSubmission = require('../../models/KyCSubmission');
const User = require('../../models/User');
const { getUploadPathFromFile } = require('../../utils/uploadPath');
const PlatformSettings = require('../../models/PlatformSettings');
const { sendAdminAlert } = require('../../services/adminAlertService');

const getDocuments = async (req, res) => {
    try {
        const documents = await KyCSubmission.findByUserId(req.user.id);
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch KYC submissions' });
    }
};

const uploadDocument = async (req, res) => {
    try {
        // The frontend sends 'category' and 'name'
        const { category, name, document_type, document_number } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'KYC document file is required'
            });
        }

        // Handling file upload metadata from multer
        const settings = await PlatformSettings.getAll();
        const autoVerified = settings.auto_kyc === true;
        const docData = {
            document_type: category || document_type || 'Identity Proof',
            document_number: name || document_number || req.file.originalname || 'N/A',
            file_path: getUploadPathFromFile(req.file),
            status: autoVerified ? 'verified' : 'pending'
        };

        const submission = await KyCSubmission.create(req.user.id, docData);
        if (!autoVerified) await sendAdminAlert('kyc_submitted', 'KYC submission received', `${req.user.email || `User ${req.user.id}`} submitted ${docData.document_type} for review.`);

        // Optional: Notify user or update profile status if needed
        // The admin review will actually change the 'verified' status later

        res.status(201).json({ 
            success: true, 
            message: autoVerified
                ? 'KYC document submitted and automatically verified'
                : 'KYC document submitted successfully and pending review',
            data: submission 
        });
    } catch (error) {
        console.error('KYC Upload Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit KYC document' });
    }
};

const deleteDocument = async (req, res) => {
    try {
        // Implementation for deleting a pending submission if allowed
        res.status(501).json({ success: false, message: 'Delete submission not implemented' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete submission' });
    }
};

module.exports = {
    getDocuments,
    uploadDocument,
    deleteDocument
};
