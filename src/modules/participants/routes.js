import express from 'express';
import {
    add_participant,
    get_by_id,
    get_league_participants,
    get_user_participation,
    update_record,
    delete_record
} from './controller.js';
import {authenticate, authorize} from '../../middleware/auth.js';

const router = express.Router();

router.post('/participant/:shareId', authenticate, add_participant);
router.get('/participant/:id', authenticate, get_by_id);
router.get('/competition/participants/:id', authenticate, get_league_participants);
router.get('/competitions/user', authenticate, authorize('user'), get_user_participation);
router.put('/participant/:id', authenticate, update_record);
router.delete('/participant/:id', authenticate, delete_record);

export default router;

