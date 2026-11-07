import League from "../competitions/schema.js";
import League_Participant from "../participants/schema.js";
import League_Matches from "./schema.js";
import Match_generation from "../../utils/match-engine.js";
import { Op } from "sequelize";

export const add_matches = async (req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide League ID'});
        };
        const league = await League.findByPk(id);
        if(!league){
            return res.status(404).json({success: false, message: 'Invalid League ID'});
        };
        const league_participants = await League_Participant.findAll({where:{league_id: league.id}});
        if(!league_participants || league_participants.length === 0){
            return res.status(404).json({success: false, message: 'No Participants Fetched'});
        };
        if(league.participant > league_participants.length){
            return res.status(400).json({success: false, message: 'Not all Participants'});
        };
        const matches = Match_generation(league_participants, league, league.match_interval);
        if(!matches){
            return res.status(500).json({success: false, message: 'Error with match generation'});
        };
        const new_matches = await League_Matches.bulkCreate(matches);
        if(!new_matches){
            return res.status(500).json({success: false, message: 'Failed to store matches'});
        };
        return res.status(200).json({success: true, message: 'Matches Created'});
    } catch (error) {
        console.error(`Error with creating league matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const owner_add_scores = async(req, res) => {
    try {
        const{League_id, id} = req.params;
        if(!id || !League_id){
            return res.status(400).json({success: false, message: 'Provide League record id'});
        };
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please Login and Try again'});
        };
        let {participant_a_scores, participant_b_scores} = req.body;
        if(!participant_a_scores || !participant_b_scores){
            return res.status(400).json({success: false, message: 'Provide the scores'})
        };
        const league = await League.findOne({where: {id: League_id, owner: user_id}});
        if(!league){
            return res.status(404).json({success: false, message: 'Not League Owner'});
        };
        const match = await League_Matches.findOne({where: {id: id, league_id: league.id}});
        if(!match){
            return res.status(404).json({success: false, message: 'Invalid ID'});
        };
        let winning_id;
        if(participant_a_scores > participant_b_scores){
            winning_id = match.participant_a;
        } else if (participant_a_scores = participant_b_scores){
            winning_id = null
        } else {
            winning_id = match.participant_b
        };
        const scores = await match.update({participant_a_score: participant_a_scores, participant_b_score: participant_b_scores, winning_id, status: 'completed'});
        if(!scores){
            return res.status(500).json({success: false, message: 'Failed To update scores', data: match});
        };
        return res.status(200).json({success: true, message: 'Scores Added'});
    } catch (error) {
        console.error(`Error with owner adding match score ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_league_matches = async(req, res) => {
    try {
        const {id}= req.params
        if(!id){
            return res.status(400).json({success: false, message: 'Provide League ID'});
        };
        const league_matches = await League_Matches.findAll({where:{league_id: id}});
        if(!league_matches || league_matches.length === 0){
            return res.status(404).json({success: false, message: 'No matches found'});
        };
        return res.status(200).json({success: true, message: 'League Matches Found', data: league_matches});
    } catch (error) {
        console.error(`Error getting a league matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const participant_matches = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide Participant ID'});
        };
        const matches = await League_Matches.findAll({where: {[Op.or]: [{participant_a: id},{participant_b: id}]}});
        if(!matches || matches.length === 0){
            return res.status(404).json({success: false, message: 'No Matches Found'});
        };
        return res.status(200).json({success: true, message: 'Participant Matches Found', data: matches})
    } catch (error) {
        console.error(`Error with getting participant matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_participant_winning_matches = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide Participant ID'});
        };
        const winning_matches = await League_Matches.findAll({where:{winning_id: id}});
        if(!winning_matches || winning_matches.length === 0){
            return res.status(404).json({success: false, message: 'No winning Matches Found'});
        };
        return res.status(200).json({success: true, message: 'Winning Matches Found', data: winning_matches});
    } catch (error) {
        console.error(`Error with getting the matches a participant has won ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_scores = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide Match ID'});
        };
        let {team_a_scores, team_b_scores} = req.body;
        const match = await League_Matches.findByPk(id);
        if(!match){
            return res.status(404).json({success: false, message: 'Invalid Match ID'});
        };
        let winning_id;
        if(team_a_scores > team_b_scores){
            winning_id = match.participant_a;
        } else if (team_a_scores = team_b_scores){
            winning_id = null
        } else {
            winning_id = match.participant_b
        };
        const updated_match = await match.update({participant_a_score: team_a_scores, participant_b_score: team_b_scores, winning_id });
        if(!updated_match){
            return res.status(500).json({success: false, message: 'Failed to update match scores'});
        };
        return res.status(200).json({success: false, message: 'Scores Updated'});
    } catch (error) {
        console.error(`Error with updating match scores ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};
