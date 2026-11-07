import League from "../competitions/schema.js";
import League_Participant from "../participants/schema.js";
import League_Matches from "./schema.js";
import Match_generation from "../../utils/match-engine.js";
import {Op} from "sequelize";

function parseScore(value) {
    if (value === undefined || value === null || value === '') return null;
    const score = Number(value);
    return Number.isInteger(score) && score >= 0 ? score : null;
}

async function updateMatchScore(match, scoreA, scoreB) {
    const winningId = scoreA === scoreB
        ? null
        : scoreA > scoreB ? match.participant_a : match.participant_b;
    await match.update({
        participant_a_score: scoreA,
        participant_b_score: scoreB,
        winner_id: winningId,
        status: 'completed',
    });
    return match;
}

export const add_matches = async (req, res) => {
    try {
        const leagueId = req.params.id ?? req.body.id;
        if (!leagueId) {
            return res.status(400).json({success: false, message: 'Provide a competition ID'});
        }
        const league = await League.findOne({where: {id: leagueId, owner: req.user.id}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found or you are not its owner'});
        }
        const participants = await League_Participant.findAll({where: {league_id: league.id}});
        if (participants.length !== league.participants) {
            return res.status(400).json({success: false, message: 'The competition must have exactly its configured number of participants'});
        }
        if (await League_Matches.count({where: {league_id: league.id}})) {
            return res.status(409).json({success: false, message: 'Fixtures have already been created'});
        }
        const fixtures = Match_generation(participants, league, league.match_interval);
        if (!fixtures.length) {
            return res.status(400).json({success: false, message: 'At least two participants are required'});
        }
        const matches = await League_Matches.bulkCreate(fixtures);
        return res.status(201).json({success: true, message: 'Fixtures created', data: matches});
    } catch (error) {
        console.error(`Error with creating competition matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const owner_add_scores = async (req, res) => {
    try {
        const league = await League.findOne({where: {id: req.params.League_id, owner: req.user.id}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found or you are not its owner'});
        }
        const match = await League_Matches.findOne({
            where: {id: req.params.id, league_id: league.id},
        });
        if (!match) {
            return res.status(404).json({success: false, message: 'Match not found'});
        }
        const scoreA = parseScore(req.body.participant_a_scores);
        const scoreB = parseScore(req.body.participant_b_scores);
        if (scoreA === null || scoreB === null) {
            return res.status(400).json({success: false, message: 'Provide non-negative whole-number scores for both participants'});
        }
        const updatedMatch = await updateMatchScore(match, scoreA, scoreB);
        return res.status(200).json({
            success: true,
            message: 'Scores added',
            data: {...updatedMatch.toJSON(), winning_id: updatedMatch.winner_id},
        });
    } catch (error) {
        console.error(`Error with owner adding match score ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_league_matches = async (req, res) => {
    try {
        const matches = await League_Matches.findAll({
            where: {league_id: req.params.id},
            order: [['round', 'ASC'], ['schedule_at', 'ASC']],
        });
        return res.status(200).json({success: true, message: 'Competition matches fetched', data: matches});
    } catch (error) {
        console.error(`Error getting competition matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const participant_matches = async (req, res) => {
    try {
        const participant = await League_Participant.findByPk(req.params.id);
        if (!participant) {
            return res.status(404).json({success: false, message: 'Participant not found'});
        }
        const league = await League.findByPk(participant.league_id);
        if (req.user.role !== 'admin' && req.user.id !== participant.user_id && req.user.id !== league?.owner) {
            return res.status(403).json({success: false, message: 'You may only view your own fixtures'});
        }
        const matches = await League_Matches.findAll({
            where: {[Op.or]: [{participant_a: participant.id}, {participant_b: participant.id}]},
            order: [['schedule_at', 'ASC']],
        });
        return res.status(200).json({success: true, message: 'Participant matches fetched', data: matches});
    } catch (error) {
        console.error(`Error with getting participant matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_participant_winning_matches = async (req, res) => {
    try {
        const participant = await League_Participant.findByPk(req.params.id);
        if (!participant) {
            return res.status(404).json({success: false, message: 'Participant not found'});
        }
        const league = await League.findByPk(participant.league_id);
        if (req.user.role !== 'admin' && req.user.id !== participant.user_id && req.user.id !== league?.owner) {
            return res.status(403).json({success: false, message: 'You may only view your own results'});
        }
        const matches = await League_Matches.findAll({where: {winner_id: participant.id}});
        return res.status(200).json({success: true, message: 'Winning matches fetched', data: matches});
    } catch (error) {
        console.error(`Error with getting participant winning matches ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_scores = async (req, res) => {
    try {
        const match = await League_Matches.findByPk(req.params.id);
        if (!match) {
            return res.status(404).json({success: false, message: 'Match not found'});
        }
        const league = await League.findOne({where: {id: match.league_id, owner: req.user.id}});
        if (!league) {
            return res.status(403).json({success: false, message: 'Only the competition owner can update scores'});
        }
        const scoreA = parseScore(req.body.team_a_scores ?? req.body.participant_a_scores);
        const scoreB = parseScore(req.body.team_b_scores ?? req.body.participant_b_scores);
        if (scoreA === null || scoreB === null) {
            return res.status(400).json({success: false, message: 'Provide non-negative whole-number scores for both participants'});
        }
        const updatedMatch = await updateMatchScore(match, scoreA, scoreB);
        return res.status(200).json({
            success: true,
            message: 'Scores updated',
            data: {...updatedMatch.toJSON(), winning_id: updatedMatch.winner_id},
        });
    } catch (error) {
        console.error(`Error with updating match scores ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};
