import express from 'express';
import fs from 'fs';
import {files} from "../../config";
import multer from 'multer';
import {uploadMedia, list} from "../controllers/media";

const upload = multer({dest: `${files.fileDirectory}/in/`});

const router = express.Router();

router.post('/upload', upload.single('file'), uploadMedia);
router.post('/search', list);
export default router;
