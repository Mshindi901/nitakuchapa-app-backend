import express from 'express';
import {
    add_matches,
    get_league_matches,
    get_participant_winning_matches,
    owner_add_scores,
    participant_matches,
    update_scores
} from './controller.js';
import {authenticate, authorize} from '../../middleware/auth.js';

const router = express.Router();

router.post('/matches/add', authenticate, authorize('user'), add_matches);
router.post('/matches/add/:id', authenticate, authorize('user'), add_matches);
router.put('/match/scores/:League_id/:id', authenticate, authorize('user'), owner_add_scores);
router.get('/competition/matches/:id', authenticate, authorize('user'), get_league_matches);
router.get('/participant/matches/:id', authenticate, authorize('user', 'admin'), participant_matches);
router.get('/partcipant/matches/:id', authenticate, authorize('user', 'admin'), participant_matches);
router.get('/participant/wins/matches/:id', authenticate, authorize('user', 'admin'), get_participant_winning_matches);
router.put('/match/:id', authenticate, authorize('user'), update_scores);

export default router;