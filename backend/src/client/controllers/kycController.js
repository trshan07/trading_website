// backend/src/controllers/kycController.js
const KyCSubmission = require('../../models/KyCSubmission');
const User = require('../../models/User');
const { getUploadPathFromFile } = require('../../utils/uploadPath');

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
        
        // Handling file upload metadata from multer
        const docData = {
            document_type: category || document_type || 'Identity Proof',
            document_number: name || document_number || 'N/A',
            file_path: getUploadPathFromFile(req.file) || '/uploads/mock_proof.jpg'
        };

        const submission = await KyCSubmission.create(req.user.id, docData);

        // Optional: Notify user or update profile status if needed
        // The admin review will actually change the 'verified' status later

        res.status(201).json({ 
            success: true, 
            message: 'KYC Document submitted successfully and pending review',
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
