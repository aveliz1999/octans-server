import express from 'express';
import authenticated from "../middleware/authenticated";
import {getTagById, getTagByName} from "../controllers/tags";

const router = express.Router();

router.use(authenticated);
router.get('/id/:id(\\d+)', getTagById);
router.get('/name/:tagName', getTagByName);

export default router;
