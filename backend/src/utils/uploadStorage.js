const path = require('path');

const resolveConfiguredUploadDir = () => {
    const configured = String(process.env.UPLOAD_PATH || '').trim();

    if (!configured) {
        return path.resolve(__dirname, '../../uploads');
    }

    if (path.isAbsolute(configured)) {
        return path.normalize(configured);
    }

    return path.resolve(__dirname, '../../', configured);
};

const getUploadDirectories = () => {
    const configuredDir = resolveConfiguredUploadDir();

    return Array.from(new Set([
        configuredDir,
        path.resolve(__dirname, '../../uploads'),
        path.resolve(__dirname, '../../public/uploads'),
        path.resolve(__dirname, '../../src/uploads'),
    ]));
};

module.exports = {
    resolveConfiguredUploadDir,
    getUploadDirectories,
};
