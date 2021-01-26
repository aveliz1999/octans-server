import express from 'express';
import authenticated from "../middleware/authenticated";
import {getTagById, getTagByName, search} from "../controllers/tags";

const router = express.Router();

router.use(authenticated);
router.get('/id/:id(\\d+)', getTagById);
router.get('/name/:tagName', getTagByName);
router.post('/search', search);

export default router;
