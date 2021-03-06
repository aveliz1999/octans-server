import express from 'express';
import fs from 'fs';
import {files} from "../../config";
import multer from 'multer';
import {uploadMedia, list, download} from "../controllers/media";

const upload = multer({dest: `${files.fileDirectory}/in/`});

const router = express.Router();

router.post('/upload', upload.single('file'), uploadMedia);
router.post('/search', list);
router.get('/:hash/:thumbnail?.(mp4|png)', download)
export default router;
