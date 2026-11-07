import Tournament from "./schema.js";
import {timeToMilliSeconds} from '../../utils/time-converter.js';

export const add_tournament = async(req, res) => {
    try {
        const {name, participant, interval_number, interval_unit, days, end_date} = req.body;
        if(!name || !participant || !interval_number || !interval_unit || !days || !end_date){
            return res.status(400).json({success: false, message: 'Missing Fields, required'});
        };
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please login and Try again'});
        };
        const match_interval = timeToMilliSeconds(interval_number, interval_unit);
        const tournament = await Tournament.create({name, owner: user_id, participant, match_interval, no_of_days: days, end_date});
        if(!tournament){
            return res.status(500).json({success: false, message: 'Failed to create tournament'});
        };
        return res.status(201).json({success: true, message: 'Tournament Created'});
    } catch (error) {
        console.error(`Error with adding new tournament record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_owner_tournaments = async(req, res) => {
    try {
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please login and Try again'});
        };
        const tournaments = await Tournament.findAll({where:{owner:user_id}});
        if(!tournaments || tournaments.length === 0){
            return res.status(404).json({success: false, message: 'No Tournaments Fetched'});
        };
        return res.status(200).json({success: true, message: 'Tournaments Fetched', data: tournaments});
    } catch (error) {
        console.error(`Error with getting owner tournaments ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_tournament_by_status = async (req, res) => {
    try {
        const {status} = req.query.q;
        if(!status){
            return res.status(400).json({success: false, message: 'Status not provided'});
        };
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please Login and Try again'});
        };
        const tournaments = await Tournament.findAll({where:{owner: user_id, status: status}});
        if(!tournaments || tournaments.length === 0){
            return res.status(404).json({success: false, message: 'No Tournaments Found'});
        };
        return res.status(200).json({success: true, message: 'Tournaments Fetched', data: tournaments});
    } catch (error) {
        console.error(`Error with getting tournament by status ${errorr}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_tournament = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'});
        };
        const {name, participant, interval_number, interval_unit, days, end_date} = req.body;
        const tournament = await Tournament.findByPk(id);
        if(!tournament){
            return res.status(404).json({success: false, message: 'Inavlid Id'});
        };
        const match_interval = timeToMilliSeconds(interval_number, interval_unit);
        const updated_tournament = await tournament.update({name, participant, match_interval, no_of_days: days, end_date});
        if(!updated_tournament){
            return res.status(500).json({success: false, message: 'Failed to update tournament'});
        };
        return res.status(200).json({success: true, message: "Tournament Updated"});
    } catch (error) {
        console.error(`Error with updating Tournament by id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_tournament = async (req,res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record ID'});
        };
        const tournament = await Tournament.findByPk(id);
        if(!tournament){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        await tournament.destroy();
        return res.status(200).json({success: true, message: 'Tournament record deleted'});
    } catch (error) {
        console.error(`Error with deleting tournament record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};