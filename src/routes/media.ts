import express from 'express';
import {files} from "../../config";
import multer from 'multer';
import {uploadMedia, list, download, listTags} from "../controllers/media";

const upload = multer({dest: `${files.fileDirectory}/in/`});

const router = express.Router();

router.post('/upload', upload.single('file'), uploadMedia);
router.post('/search', list);
router.get('/download/:hash/:thumbnail?.(mp4|png)', download)
router.get('/:id/tags', listTags);
export default router;
