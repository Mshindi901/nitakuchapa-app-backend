import express from 'express';
import {
    add_match_results,
    get_league_table,
    toggle_status
} from './controller.js';
import {authenticate, authorize} from '../../middleware/auth.js';

const router = express.Router();

router.post('/points/id', authenticate, authorize('user'), add_match_results);
router.post('/points/:id', authenticate, authorize('user'), add_match_results);
router.get('/points/competition/:id', get_league_table);
router.put('/status/competition/:id', authenticate, authorize('user'), toggle_status);

export default router;