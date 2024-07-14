import config from '#root/config'
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import User from '#root/db/models/User'
import Announcement from '#root/db/models/Announcement';
import Course from '#root/db/models/Course';
import Assignment from '#root/db/models/Assignment';
import Attendance from '#root/db/models/Attendance';

const { ObjectId } = mongoose.Types;

const MODELS = {
    User,
    Announcement,
    Course,
    Assignment,
    Attendance,    
};

const COLLECTION_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'data');

const convertFields = (item) => {
    // Convert _id field
    if (item._id && item._id.$oid) {
        item._id = new ObjectId(item._id.$oid);
    }

    // Convert date field
    if (item.date && item.date.$date) {
        item.date = new Date(item.date.$date);
    }

    // Convert teacher field
    if (item.teacher && item.teacher.$oid) {
        item.teacher = new ObjectId(item.teacher.$oid);
    }

    // Convert students array
    if (item.students) {
        item.students = item.students.map(student => {
            if (student.$oid) {
                return new ObjectId(student.$oid);
            }
            return student;
        });
    }

    // Convert startDate field
    if (item.startDate && item.startDate.$date) {
        item.startDate = new Date(item.startDate.$date);
    }

    // Convert endDate field
    if (item.endDate && item.endDate.$date) {
        item.endDate = new Date(item.endDate.$date);
    }

    // Convert excludeDates array
    if (item.excludeDates) {
        item.excludeDates = item.excludeDates.map(date => {
            if (date.$date) {
                return new Date(date.$date);
            }
            return date;
        });
    }

    // Convert dueDate field
    if (item.dueDate && item.dueDate.$date) {
        item.dueDate = new Date(item.dueDate.$date);
    }

    // Convert courseId field
    if (item.courseId && item.courseId.$oid) {
        item.courseId = new ObjectId(item.courseId.$oid);
    }

    // Convert uploadDate field
    if (item.uploadDate && item.uploadDate.$date) {
        item.uploadDate = new Date(item.uploadDate.$date);
    }

    // Convert results array
    if (item.results) {
        item.results = item.results.map(result => {
            // Convert studentId field within results
            if (result.studentId && result.studentId.$oid) {
                result.studentId = new ObjectId(result.studentId.$oid);
            }
            // Convert uploadDate field within results
            if (result.uploadDate && result.uploadDate.$date) {
                result.uploadDate = new Date(result.uploadDate.$date);
            }
            // Convert _id field within results
            if (result._id && result._id.$oid) {
                result._id = new ObjectId(result._id.$oid);
            }
            return result;
        });
    }

    // Convert student field
    if (item.student && item.student.$oid) {
        item.student = new ObjectId(item.student.$oid);
    }

    // Convert course field
    if (item.course && item.course.$oid) {
        item.course = new ObjectId(item.course.$oid);
    }

    return item;
};


const loadTestData = async () => {
    console.log('[DB] checking collections...');

    fs.readdir(COLLECTION_PATH, async (err, files) => {
        if (err) {
            console.log('Error reading directory:', err);
            return;
        }

        for (const file of files) {
            if (path.extname(file) === '.json') {
                const collectionName = path.basename(file, '.json');
                const model = MODELS[collectionName];
                if (!model) {
                    console.log(`No model found for collection: ${collectionName}`);
                    continue;
                }

                const existingDocuments = await model.findOne();
                if (existingDocuments) {
                    console.log(`[DB] Collection ${collectionName} already exists, skipping import.`);
                    continue;
                }

                try {
                    let data = JSON.parse(fs.readFileSync(path.join(COLLECTION_PATH, file), 'utf8'));
                    
                    data = data.map(convertFields); // Convert error fields
                    
                    await model.insertMany(data);
                    console.log(`[DB] Imported ${data.length} documents into ${collectionName} collection.`);
                } catch (importError) {
                    console.log(`[DB] Error importing ${collectionName}:`, importError);
                }
            }
        }
    });
};

export default async () => {
    await loadTestData();
    // const adminData = config.db.adminData
    // const user = await User.findOne({ email: adminData.email })
    // if (!user) {
    //     console.log('[DB] initializing...')
    //     try {
    //         const admin = new User(adminData)
    //         await admin.save()
    //     } catch (err) {
    //         console.log('[DB] initializetion', err)
    //     }
    // }
}
