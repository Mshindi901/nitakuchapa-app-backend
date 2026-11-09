import express from 'express';
import {
    add_league,
    get_owner_competitions,
    get_owner_competitions_by_type,
    get_competition_by_code,
    get_all_competitions,
    get_competition_by_share_code,
    get_all_comepetitions_by_type,
    get_competition_by_status,
    update_competition,
    delete_competition
} from './controller.js';
import {authenticate, authorize} from '../../middleware/auth.js';

const router = express.Router();

router.post('/competition', authenticate, authorize('user'), add_league);
router.get('/admin/competitions', authenticate, authorize('user'), get_owner_competitions);
router.get('/admin/competitions/type', authenticate, authorize('user'), get_owner_competitions_by_type);
router.post('/competitions/invite/code', authenticate, authorize('user'), get_competition_by_code);
router.get('/competitions', authenticate, authorize('admin'), get_all_competitions);
router.get('/competition/invite/:shareId', get_competition_by_share_code);
router.get('/competitions/type', authenticate, authorize('admin'), get_all_comepetitions_by_type);
router.get('/competitions/status', authenticate, authorize('user'), get_competition_by_status);
router.put('/competition/:id', authenticate, authorize('user'), update_competition);
router.delete('/competition/:id', authenticate, authorize('user'), delete_competition);

export default router;