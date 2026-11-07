import User from "./schema.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const publicAttributes = { exclude: ['password'] };

function getUserName(req) {
    return req.body.name ?? req.body.username;
}

function getQueryValue(value) {
    return typeof value === 'string' ? value : value?.name ?? value?.email;
}

export const sign_up = async (req, res) => {
    try {
        const username = getUserName(req)?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const {password} = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({success: false, message: 'Name, email, and password are required'});
        }
        const existingUser = await User.findOne({where: {email}});
        if (existingUser) {
            return res.status(409).json({success: false, message: 'Email exists'});
        }
        const user = await User.create({username, email, password: await bcrypt.hash(password, 12)});
        return res.status(201).json({
            success: true,
            message: 'User signed up',
            data: {id: user.id, username: user.username, email: user.email, role: user.role},
        });
    } catch (error) {
        console.error(`Error with signing up user ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const admin_sign_up = async (req, res) => {
    try {
        const username = getUserName(req)?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const {password} = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({success: false, message: 'Name, email, and password are required'});
        }
        const existingUser = await User.findOne({where: {email}});
        if (existingUser) {
            return res.status(409).json({success: false, message: 'Email exists'});
        }
        const user = await User.create({
            username,
            email,
            password: await bcrypt.hash(password, 12),
            role: 'admin',
        });
        return res.status(201).json({
            success: true,
            message: 'Admin signed up',
            data: {id: user.id, username: user.username, email: user.email, role: user.role},
        });
    } catch (error) {
        console.error(`Error with admin signing up ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const sign_in = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const {password} = req.body;
        if (!email || !password) {
            return res.status(400).json({success: false, message: 'Email and password are required'});
        }
        const user = await User.findOne({where: {email}});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({success: false, message: 'Invalid email or password'});
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({success: false, message: 'Authentication is not configured'});
        }
        const token = jwt.sign(
            {id: user.id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '1h'},
        );
        return res.status(200).json({
            success: true,
            message: 'Signed in',
            token,
            data: {id: user.id, username: user.username, email: user.email, role: user.role},
        });
    } catch (error) {
        console.error(`Error with signing in user ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_by_name = async (req, res) => {
    try {
        const name = getQueryValue(req.query.q) ?? req.query.name;
        if (!name) {
            return res.status(400).json({success: false, message: 'Provide a name'});
        }
        const user = await User.findOne({where: {username: name}, attributes: publicAttributes});
        if (!user) {
            return res.status(404).json({success: false, message: 'No user found'});
        }
        return res.status(200).json({success: true, message: 'User found', data: user});
    } catch (error) {
        console.error(`Error with getting a user record by name ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_by_email = async (req, res) => {
    try {
        const email = (getQueryValue(req.query.q) ?? req.query.email)?.toLowerCase();
        if (!email) {
            return res.status(400).json({success: false, message: 'Provide an email'});
        }
        const user = await User.findOne({where: {email}, attributes: publicAttributes});
        if (!user) {
            return res.status(404).json({success: false, message: 'No user found'});
        }
        return res.status(200).json({success: true, message: 'User found', data: user});
    } catch (error) {
        console.error(`Error with getting user by email ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_by_id = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {attributes: publicAttributes});
        if (!user) {
            return res.status(404).json({success: false, message: 'Invalid ID'});
        }
        return res.status(200).json({success: true, message: 'User found', data: user});
    } catch (error) {
        console.error(`Error with getting the user by record id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_all_users = async (req, res) => {
    try {
        const users = await User.findAll({attributes: publicAttributes});
        return res.status(200).json({success: true, message: 'Users fetched', data: users});
    } catch (error) {
        console.error(`Error getting all the user records ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_user_by_id = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({success: false, message: 'Invalid ID'});
        }
        if (req.user.role !== 'admin' && req.user.id !== user.id) {
            return res.status(403).json({success: false, message: 'You may only update your own account'});
        }

        const updates = {};
        const username = getUserName(req)?.trim();
        const email = req.body.email?.trim().toLowerCase();
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 12);
        if (!Object.keys(updates).length) {
            return res.status(400).json({success: false, message: 'Provide at least one field to update'});
        }
        await user.update(updates);
        return res.status(200).json({
            success: true,
            message: 'User updated',
            data: {id: user.id, username: user.username, email: user.email, role: user.role},
        });
    } catch (error) {
        console.error(`Error with updating the user record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_user = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({success: false, message: 'Invalid ID'});
        }
        if (req.user.role !== 'admin' && req.user.id !== user.id) {
            return res.status(403).json({success: false, message: 'You may only delete your own account'});
        }
        await user.destroy();
        return res.status(200).json({success: true, message: 'User deleted'});
    } catch (error) {
        console.error(`Error with deleting user record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};
