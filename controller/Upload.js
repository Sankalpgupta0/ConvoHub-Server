import { uploadOnCloudinary } from "../helpers/cloudinary.js";

const uploadImage = async (req, res) => {
    const localFilePath = req.file?.path;
    // console.log(req.file.)
    try {
        const uploadResponse = await uploadOnCloudinary(localFilePath);
        if (uploadResponse) {
            res.status(200).json({
                message: 'File uploaded successfully',
                data: uploadResponse
            });
        } else {
            res.status(500).json({ message: 'Failed to upload file' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error });
    }
}

const uploadVideo = async (req, res) => {
    const localFilePath = req.file?.path;
    // console.log(req.file.)
    try {
        const uploadResponse = await uploadOnCloudinary(localFilePath);
        if (uploadResponse) {
            res.status(200).json({
                message: 'File uploaded successfully',
                data: uploadResponse
            });
        } else {
            res.status(500).json({ message: 'Failed to upload file' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error });
    }
}

const uploadPDF = async (req, res) => {
    const localFilePath = req.file?.path;
    // console.log(req.file.)
    try {
        const uploadResponse = await uploadOnCloudinary(localFilePath);
        if (uploadResponse) {
            res.status(200).json({
                message: 'File uploaded successfully',
                data: uploadResponse
            });
        } else {
            res.status(500).json({ message: 'Failed to upload file' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error });
    }
}

export { uploadVideo, uploadImage, uploadPDF }