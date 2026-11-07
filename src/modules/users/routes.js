import express from 'express';
import {
    sign_up,
    admin_sign_up,
    sign_in,
    get_all_users,
    get_user_by_email,
    get_user_by_id,
    get_user_by_name,
    update_user_by_id,
    delete_user
} from './controller.js';
import {authenticate, authorize} from '../../middleware/auth.js';

const router = express.Router();

router.post('/auth/signup', sign_up);
router.post('/admin/auth/signup', admin_sign_up);
router.post('/auth/signin', sign_in);
router.get('/users', authenticate, authorize('admin'), get_all_users);
router.get('/users/email', authenticate, authorize('user', 'admin'), get_user_by_email);
router.get('/user/:id', authenticate, get_user_by_id);
router.get('/user/name', authenticate, authorize('user', 'admin'), get_user_by_name);
router.put('/user/:id', authenticate, authorize('user'), update_user_by_id);
router.delete('/user/:id', delete_user);

export default router;