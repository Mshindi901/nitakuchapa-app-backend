import User from "./schema.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const sign_up = async(req, res) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({success: false, message: 'Internal Server Error'});
        };
        const is_user = await User.findOne({where:{email: email}});
        if(is_user){
            return res.status(400).json({success: false, message: 'Email exists'});
        };
        const hashed_password = await bcrypt.hash(password, 12);
        const user = await User.create({name, email, password: hashed_password});
        if(!user){
            return res.status(500).json({success: false, message: 'Signup failed'});
        };
        return res.status(201).json({success: true, message: 'user signed up'});
    } catch (error) {
        console.error(`Error with signing up user ${error}`);
        return res.status(500).json({sucess: false, message: 'Internal Server Error'})
    }
};

export const admin_sign_up = async(req, res) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({success: false, message: 'Internal Server Error'});
        };
        const is_user = await User.findOne({where:{email: email}});
        if(is_user){
            return res.status(400).json({success: false, message: 'Email exists'});
        };
        const hashed_passsword = await bcrypt.hash(password, 12);
        const admin = await User.create({name, email, password: hashed_passsword, role: 'admin'});
        if(!admin){
            return res.status(500).json({success: false, message: 'Admin signup failed'});
        };
        return res.status(201).json({success: true, message: 'Admin signed up'});
    } catch (error) {
        console.error(`Error with admin signing up ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const sign_in = async(req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({success: false, message: 'Missing fields'});
        };
        const is_user = await User.findOne({where:{email: email}});
        if(!is_user){
            return res.status(404).json({success: false, message: 'Email does not exist'});
        };
        const is_password = await bcrypt.compare(password, is_user.password);
        if(!is_password){
            return res.status(400).json({success: false, message: 'Inavlid password'});
        };
        const token = jwt.sign({id: is_user.id, email: is_user.email, role: is_user.role}, JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({success: true, message: 'Signed in'});
    } catch (error) {
        console.error(`Error with signin in user ${error}`);
        return res.status(500).json({success: false, message:'internal server error'});
    }
};

export const get_user_by_name = async(req, res) => {
    try {
        const {name} = req.query.q;
        if(!name){
            return res.status(400).json({success: false, message: 'Provide name'});
        };
        const user = await User.findOne({where:{username: name}});
        if(!user){
            return res.status(400).json({success: false, message: 'No user found'});
        };
        return res.status(200).json({success: true, message: 'User Found', data: user})
    } catch (error) {
        console.error(`Error with getting a user record by name ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_by_email = async(req, res) => {
    try {
        const {email} = req.query.q;
        if(!email){
            return res.status(400).json({success: false, message: 'Provide email'});
        };
        const user = await User.findOne({where:{email: email}});
        if(!user){
            return res.status(400).json({success: false, message: 'No user found'});
        };
        return res.status(200).json({success: false, message: 'User Found', data: user})
    } catch (error) {
        console.error(`Error with getting user by email ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_by_id = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'})
        };
        const user = await User.findByPk(id);
        if(!user){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        return res.status(200).json({success: true, message: 'User Found', data: user});
    } catch (error) {
        console.error(`Error with getting the user by record id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_all_users = async(req, res) => {
    try {
        const users = await User.findAll();
        if(!users || users.length === 0){
            return res.status(404).json({success: false, message: 'No user found'});
        };
        return res.status(200).json({success: true, message: 'Users Fetched', data: users});        
    } catch (error) {
        console.error(`Error getting all the user records ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'})
    }
};

export const update_user_by_id = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'})
        };
        const {name, email, password} = req.body;
        const user = await User.findByPk(id);
        if(!user){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        if(email === user.email || name === user.username){
            return res.status(400).json({success: false, message: 'Email or name is same as before'});
        };
        const is_same_password = await bcrypt.compare(password, user.password);
        if(is_same_password){
            return res.status(404).json({success: false, message: 'Password is same as before'});
        };
        const hashed_password = await bcrypt.hash(password, 12);
        const updated_user = await user.update({name, email, password: hashed_password});
        if(!updated_user){
            return res.status(500).json({success: false, message: 'Failed to update Password'});
        };
        return res.status(200).json({success: true, message: 'User Updated'});
    } catch (error) {
        console.error(`Error with updating the user record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Sercer Error'});
    }
};

export const delete_user = async (req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'})
        };
        const user = await User.findByPk(id);
        if(!user){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        await user.destroy();
        return res.status(200).json({success: true, message: 'User Deleted'})
    } catch (error) {
        console.error(`Error with deleting user record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};