import express from 'express';
import {
    add_match_results,
    get_league_table,
    toggle_status
} from './controller.js';

const router = express.Router();

router.post('/points/id', add_match_results);
router.get('/points/competition/:id', get_league_table);
router.put('/status/competition/:id', toggle_status);

export default router;