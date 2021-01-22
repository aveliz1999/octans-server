import express from 'express';
import {createUser, login} from '../controllers/users';


const router = express.Router();

router.post('/', createUser);
router.post('/login', login);

export default router;
