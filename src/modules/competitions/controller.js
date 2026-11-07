import League from "./schema.js";
import League_Participant from "../participants/schema.js";
import {timeToMilliSeconds} from  '../../utils/time-converter.js';
import {randomBytes} from 'crypto';

export const add_league = async(req, res) => {
    try {
        //interval number is the number part of the converter function
        //Heavenly God hope this shit works
        const {name, type, participant, interval_number, interval_unit, start_date, end_date, no_of_days} = req.body;
        if(!name || !type || !participant || !interval_number || !interval_unit || !start_date){
            return res.status(400).json({success: false, message: 'Missing Fields'});
        };
        const {team_name, player_name} = req.body;
        if(!team_name || !player_name){
            return res.status(400).json({success: false, message: 'Attach Team name for partcipation registration'});
        };
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please Login and be authentiated'});
        };
        const share_code = randomBytes(16).toString('hex');
        const match_interval = timeToMilliSeconds(interval_number, interval_unit);
        const league = await League.create({name, owner: user_id, share_code, type, participant, match_interval, start_date, end_date, no_of_days});
        if(!league){
            return res.status(500).json({success: false, message: 'Failed to create League'});
        };
        const participant_one = await League_Participant.create({league_id: league.id, user_id: user_id, player_name: player_name, team_name});
        if(!participant_one){
            return res.status(500).json({success: false, message: 'League created, failed to add participant'});
        };
        return res.status(201).json({success: true, message: 'League added and added to Participants'});
    } catch (error) {
        console.error(`Error with adding a new league record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_owner_competitions = async(req, res) => {
    try {
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please Login and Try again'})
        };
        const leagues = await League.findAll({where:{owner: user_id}});
        if(!leagues || leagues.length === 0){
            return res.status(404).json({success: false, message: 'No Leagues Found'});
        };
        return res.status(200).json({success: true, message: 'Leagues found', data: leagues})
    } catch (error) {
        console.error(`Error with getting user leagues ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_owner_competitions_by_type = async(req, res) => {
    try {
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'PLease login and Try again'});
        };
        const{type} = req.query.q;
        if(!type){
            return res.status(400).json({success: false, message: 'Provide The type query'});
        };
        const competitions = await League.findAll({type: type, owner: user_id});
        if(!competitions || competitions.length === 0){
            return res.status(404).json({success: false, message: 'Missing competitions'});
        };
        return res.status(200).json({success: false, message: 'Competitions Fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting owner competitions by tournament ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_all_competitions = async(req, res) => {
    try {
        const all_leagues = await League.findAll();
        if(!all_leagues || all_leagues.length === 0){
            return res.status(404).json({success: false, message: 'No Leagues Found'});
        };
        return res.status(200).json({success: true, message: 'Leagues Fetched', data: all_leagues});
    } catch (error) {
        console.error(`Error with getting all the leagues ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_all_comepetitions_by_type = async(req, res) => {
    try {
        const{type} = req.query.q;
        if(!type){
            return res.status(400).json({success: false, message: 'Provide The type query'});
        };
        const competitions = await League.findAll({type: type});
        if(!competitions || competitions.length === 0){
            return res.status(404).json({success: false, message: 'Missing competitions'});
        };
        return res.status(200).json({success: true, message: 'Competitions Fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting competitions by type ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_competition_by_status = async(req, res) => {
    try {
        const {status} = req.query.q;
        if(!status){
            return res.status(400).json({success: false, message: 'Provide status'});
        };
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please login and try again'});
        };
        const leagues = await League.findAll({where:{owner: user_id, status: status}});
        if(!leagues || leagues.length===0){
            return res.status(404).json({success: false, message: 'No Leagues found'});
        };
        return res.status(200).json({success: true, message: 'Leagues Fetched', data: leagues});
    } catch (error) {
        console.error(`Error with getting all the active leagues ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};


export const update_competition = async(req, res) => {
    try {
        const {name, participant, interval_number, interval_unit, start_date, end_date} = req.body;
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Please Provide the record id'});
        };
        const league = await League.findByPk(id);
        if(!league){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        const match_interval = timeToMilliSeconds(interval_number, interval_unit);
        const updated_league = await league.update({name, participant, match_interval, start_date, end_date});
        if(!updated_league){
            return res.status(500).json({success: false, message: 'Failed to update league record'});
        };
        return res.status(200).json({success: true, message: 'Record updated'});
    } catch (error) {
        console.error(`Error with updating the league record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_competition = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'record id not provided'});
        };
        const league = await League.findByPk(id);
        if(!league){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        await league.destroy();
        return res.status(200).json({success: true, message: 'League deleted'});
    } catch (error) {
        console.error(`Error with deleting a league ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};