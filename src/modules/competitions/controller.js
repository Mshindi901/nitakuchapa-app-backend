import {randomBytes, randomInt} from 'node:crypto';
import sequelize from '../../database/config.js';
import League from "./schema.js";
import League_Participant from "../participants/schema.js";
import League_Matches from "../matches/schema.js";
import League_Point from "../points_table/schema.js";
import {timeToMilliSeconds} from '../../utils/time-converter.js';

function getQueryValue(value) {
    return typeof value === 'string' ? value : value?.type ?? value?.status;
}

function getParticipantCount(body) {
    return Number(body.participants ?? body.participant);
}

export const add_league = async (req, res) => {
    try {
        const {name, type, interval_number, interval_unit, start_date, no_of_days} = req.body;
        const participantCount = getParticipantCount(req.body);
        const playerName = req.body.player_name?.trim();
        const teamName = req.body.team_name?.trim();
        if (!name?.trim() || !['league', 'tournament'].includes(type) ||
            !Number.isInteger(participantCount) || participantCount < 2 ||
            !interval_number || !interval_unit || !start_date || !playerName || !teamName) {
            return res.status(400).json({success: false, message: 'Provide a name, type, at least two participants, a match interval, start date, player name, and team name'});
        }
        const competition_code = randomInt(100000, 1000000).toString();
        const matchInterval = timeToMilliSeconds(interval_number, interval_unit);
        const result = await sequelize.transaction(async (transaction) => {
            const league = await League.create({
                name: name.trim(),
                owner: req.user.id,
                competition_code: competition_code,
                share_code: randomBytes(16).toString('hex'),
                type,
                participants: participantCount,
                match_interval: matchInterval,
                start_date,
                end_date: req.body.end_date || start_date,
                no_of_days: no_of_days ? Number(no_of_days) : null,
            }, {transaction});
            const participant = await League_Participant.create({
                league_id: league.id,
                user_id: req.user.id,
                player_name: playerName,
                team_name: teamName,
            }, {transaction});
            await League_Point.create({
                competition_id: league.id,
                participant_id: participant.id,
            }, {transaction});
            return league;
        });
        return res.status(201).json({success: true, message: 'Competition created', data: result});
    } catch (error) {
        console.error(`Error with adding a new competition record ${error}`);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({success: false, message: 'A competition with that name already exists'});
        }
        if (error.message?.includes('interval')) {
            return res.status(400).json({success: false, message: error.message});
        }
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_owner_competitions = async (req, res) => {
    try {
        const competitions = await League.findAll({where: {owner: req.user.id}});
        return res.status(200).json({success: true, message: 'Competitions fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting user competitions ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_competition_by_code = async(req, res) => {
    try {
        const {code} = req.body;
        if(!code){
            return res.status(400).json({success: false, message: 'Provide Code'});
        };
        const competition = await League.findOne({where:{competition_code: code}});
        if(!competition){
            return res.status(404).json({success: false, message: 'No Competition Found'});
        };
        return res.status(200).json({success: true, message: 'Fetched Competition', data: competition});
    } catch (error) {
        console.error(`Error with getting a competition by the code ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};


export const get_owner_competitions_by_type = async (req, res) => {
    try {
        const type = getQueryValue(req.query.q) ?? req.query.type;
        if (!['league', 'tournament'].includes(type)) {
            return res.status(400).json({success: false, message: 'Provide a valid competition type'});
        }
        const competitions = await League.findAll({where: {type, owner: req.user.id}});
        return res.status(200).json({success: true, message: 'Competitions fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting owner competitions by type ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_all_competitions = async (req, res) => {
    try {
        const competitions = await League.findAll();
        return res.status(200).json({success: true, message: 'Competitions fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting all competitions ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_competition_by_share_code = async (req, res) => {
    try {
        const competition = await League.findOne({
            where: {share_code: req.params.shareId, status: 'active'},
            attributes: ['id', 'name', 'type', 'participants', 'start_date', 'end_date', 'status', 'share_code'],
        });
        if (!competition) {
            return res.status(404).json({success: false, message: 'Competition invite is invalid or inactive'});
        }
        return res.status(200).json({success: true, message: 'Competition invite fetched', data: competition});
    } catch (error) {
        console.error(`Error with getting competition invite ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_all_comepetitions_by_type = async (req, res) => {
    try {
        const type = getQueryValue(req.query.q) ?? req.query.type;
        if (!['league', 'tournament'].includes(type)) {
            return res.status(400).json({success: false, message: 'Provide a valid competition type'});
        }
        const competitions = await League.findAll({where: {type}});
        return res.status(200).json({success: true, message: 'Competitions fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting competitions by type ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_competition_by_status = async (req, res) => {
    try {
        const status = getQueryValue(req.query.q) ?? req.query.status;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({success: false, message: 'Provide a valid competition status'});
        }
        const competitions = await League.findAll({where: {owner: req.user.id, status}});
        return res.status(200).json({success: true, message: 'Competitions fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting competitions by status ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_competition = async (req, res) => {
    try {
        const league = await League.findOne({where: {id: req.params.id, owner: req.user.id}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found'});
        }
        const updates = {};
        if (req.body.name !== undefined) updates.name = req.body.name.trim();
        const participantCount = getParticipantCount(req.body);
        if (req.body.participant !== undefined || req.body.participants !== undefined) {
            const currentCount = await League_Participant.count({where: {league_id: league.id}});
            if (!Number.isInteger(participantCount) || participantCount < currentCount) {
                return res.status(400).json({success: false, message: 'Participant limit cannot be lower than the current participant count'});
            }
            updates.participants = participantCount;
        }
        if (req.body.start_date !== undefined) updates.start_date = req.body.start_date;
        if (req.body.end_date !== undefined) updates.end_date = req.body.end_date;
        if (req.body.interval_number !== undefined || req.body.interval_unit !== undefined) {
            if (req.body.interval_number === undefined || req.body.interval_unit === undefined) {
                return res.status(400).json({success: false, message: 'Provide both interval_number and interval_unit'});
            }
            updates.match_interval = timeToMilliSeconds(req.body.interval_number, req.body.interval_unit);
        }
        if (!Object.keys(updates).length) {
            return res.status(400).json({success: false, message: 'Provide at least one field to update'});
        }
        await league.update(updates);
        return res.status(200).json({success: true, message: 'Competition updated', data: league});
    } catch (error) {
        console.error(`Error with updating the competition record ${error}`);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({success: false, message: 'A competition with that name already exists'});
        }
        if (error.message?.includes('interval')) {
            return res.status(400).json({success: false, message: error.message});
        }
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_competition = async (req, res) => {
    try {
        const league = await League.findOne({where: {id: req.params.id, owner: req.user.id}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found'});
        }
        await sequelize.transaction(async (transaction) => {
            await League_Point.destroy({where: {competition_id: league.id}, transaction});
            await League_Matches.destroy({where: {league_id: league.id}, transaction});
            await League_Participant.destroy({where: {league_id: league.id}, transaction});
            await league.destroy({transaction});
        });
        return res.status(200).json({success: true, message: 'Competition deleted'});
    } catch (error) {
        console.error(`Error with deleting a competition ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};
