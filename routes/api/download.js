import mongoose from 'mongoose';
import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';
import Assignment from '#root/db/models/Assignment';

export default (app, utils) => {  
    app.get('/download/:assignmentId/:studentId', async (req, res) => {
        try {
            const { assignmentId, studentId } = req.params;
            const assignment = await Assignment.findById(assignmentId);
            const studentResult = assignment.results.find(result => result.studentId.toString() === studentId);
            const fileUrl = studentResult.studentFileUrl;
            const originalFileName = studentResult.originalFileName;

            // Get the file name from fileURL
            const fileName = path.basename(fileUrl);

            // Create a tmp path to save the file
            const tmpFilePath = path.join(appRoot, 'uploads/tmp', fileName)

            console.log('fileName', fileName) //dubug line
            console.log('tmpFilePath', tmpFilePath) //dubug line

            // Ensure the tmp directory exists
            await fs.ensureDir(path.dirname(tmpFilePath));

            // Download file from  fileURL
            const response = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream'
            });

            // Stream the file to tmp location
            const writer = fs.createWriteStream(tmpFilePath);
            response.data.pipe(writer);

            writer.on('finish', () => {
                // Download file with original name
                res.download(tmpFilePath, originalFileName, (err) => {
                    if (err) {
                        console.error('Error during file download:', err);
                        return res.status(500).send('Server Error');
                    }

                    // Delete tmp file
                    fs.remove(tmpFilePath, (err) => {
                        if (err) console.error('Error removing temp file:', err);
                    });
                });
            });

            writer.on('error', (err) => {
                console.error('Error writing file:', err);
                res.status(500).send('Server Error');
            });

        } catch (error) {
            console.error('Server Error:', error);
            res.status(500).send('Server Error');
        }
    });
}