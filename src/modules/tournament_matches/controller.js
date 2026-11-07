import Tournament_match from "./schema.js";
import Tournament from '../tournaments/schema.js';
import Tournament_Participant from "../tournament-participants/schema";
import Match_generation from "../../utils/match-engine.js";

export const add_matches = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Please Attach Tournament ID'});
        };
        const tournament = await Tournament.findByPk(id);
        if(!tournament){
            return res.status(404).json({success: false, message: 'Invalid Tournament ID'});
        };
        const tournament_participants = await Tournament_Participant.findAll({where: {tournament_id: tournament.id}});
        if(!tournament_participants || tournament_participants.length === 0){
            return res.status(404).json({success: false, message: 'NO Tournament Participants Fetched'});
        };
        if(tournament.participant > tournament_participants.length){
            return res.status(400).json({success: false, message: 'Not all Participants'});
        };
        const tournament_matches = Match_generation(tournament_participants, tournament, tournament.match_interval);
        if(!tournament_matches){
            return res.status(500).json({success: false, message: 'Failed to Create Tournament matches'});
        };
        const new_matches = await Tournament_match.bulkCreate(tournament_matches);
        if(!new_matches){
            return res.status(500).json({success: false, message: 'Failed to save Matches'});
        };
        return res.status(201).json({success: true, message: 'Matches Created'});
    } catch (error) {
        console.error(`Error creating a new tournament match ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const admin_add_scores = async(req, res) => {
    try {
        const{tournament_id, match_id}= req.params;
        const user_id = req.user.id;
        const {scores_a, scores_b} = req.body;
        if(!tournament_id || !match_id || !user_id){
            return res.status(400).json({success: false, message: 'Please Login and Try again and provide Tournament_Id and Match_id'});
        };
        const tournament = await Tournament.findOne({where: {id: tournament_id, owner: user_id}});
        if(!tournament){
            return res.status(404).json({success: false, message: 'No user Tournament Found'});
        };
        const match = await Tournament_match.findOne({where:{id: match_id, tournament_id: tournament.id}});
        if(!match){
            return res.status(404).json({success: false, message: 'No Match Found'});
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
        console.error(`Error with tournament admin adding scores ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};