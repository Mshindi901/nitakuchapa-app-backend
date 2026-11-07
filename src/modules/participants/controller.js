import sequelize from "../../database/config.js";
import League_Participant from "./schema.js";
import League from "../competitions/schema.js";
import League_Point from "../points_table/schema.js";
import League_Matches from "../matches/schema.js";
import Match_generation from "../../utils/match-engine.js";

export const add_participant = async (req, res) => {
    try {
        const playerName = req.body.player_name?.trim();
        const teamName = req.body.team_name?.trim();
        if (!playerName || !teamName) {
            return res.status(400).json({success: false, message: 'Player name and team name are required'});
        }
        const league = await League.findOne({where: {share_code: req.params.shareId, status: 'active'}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition invite is invalid or inactive'});
        }

        const participant = await sequelize.transaction(async (transaction) => {
            const lockedLeague = await League.findByPk(league.id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!lockedLeague || lockedLeague.status !== 'active') {
                const error = new Error('Competition invite is invalid or inactive');
                error.status = 404;
                throw error;
            }
            const currentParticipants = await League_Participant.findAll({
                where: {league_id: lockedLeague.id},
                transaction,
            });
            if (currentParticipants.length >= lockedLeague.participants) {
                const error = new Error('Maximum participants reached');
                error.status = 409;
                throw error;
            }
            if (req.user?.id && currentParticipants.some((entry) => entry.user_id === req.user.id)) {
                const error = new Error('You have already joined this competition');
                error.status = 409;
                throw error;
            }
            const newParticipant = await League_Participant.create({
                league_id: lockedLeague.id,
                user_id: req.user?.id ?? null,
                player_name: playerName,
                team_name: teamName,
            }, {transaction});
            await League_Point.create({
                competition_id: lockedLeague.id,
                participant_id: newParticipant.id,
            }, {transaction});

            const participants = [...currentParticipants, newParticipant];
            if (participants.length === lockedLeague.participants) {
                const fixtures = Match_generation(participants, lockedLeague, lockedLeague.match_interval);
                await League_Matches.bulkCreate(fixtures, {transaction});
            }
            return newParticipant;
        });
        return res.status(201).json({success: true, message: 'Participant joined the competition', data: participant});
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({success: false, message: error.message});
        }
        console.error(`Error with adding new competition participant ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_league_participants = async (req, res) => {
    try {
        const league = await League.findByPk(req.params.id);
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found'});
        }
        const participants = await League_Participant.findAll({where: {league_id: league.id}});
        return res.status(200).json({success: true, message: 'Participants fetched', data: participants});
    } catch (error) {
        console.error(`Error with getting competition participants ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_participation = async (req, res) => {
    try {
        const participations = await League_Participant.findAll({
            where: {user_id: req.user.id},
            attributes: ['league_id'],
            group: ['league_id'],
        });
        const competitionIds = participations.map((entry) => entry.league_id);
        const competitions = competitionIds.length
            ? await League.findAll({where: {id: competitionIds}})
            : [];
        return res.status(200).json({success: true, message: 'Participating competitions fetched', data: competitions});
    } catch (error) {
        console.error(`Error with getting the competitions a user participates in ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_by_id = async (req, res) => {
    try {
        const participant = await League_Participant.findByPk(req.params.id);
        if (!participant) {
            return res.status(404).json({success: false, message: 'No participant found'});
        }
        return res.status(200).json({success: true, message: 'Participant fetched', data: participant});
    } catch (error) {
        console.error(`Error with getting participant by id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

async function findEditableParticipant(req) {
    const participant = await League_Participant.findByPk(req.params.id);
    if (!participant) return {participant: null, status: 404, message: 'No participant found'};
    const league = await League.findByPk(participant.league_id);
    if (req.user.role !== 'admin' &&
        req.user.id !== participant.user_id &&
        req.user.id !== league?.owner) {
        return {participant: null, status: 403, message: 'You may only manage your own entry or a competition you own'};
    }
    return {participant};
}

export const update_record = async (req, res) => {
    try {
        const playerName = req.body.player_name?.trim();
        const teamName = req.body.team_name?.trim();
        if (!playerName || !teamName) {
            return res.status(400).json({success: false, message: 'Player name and team name are required'});
        }
        const result = await findEditableParticipant(req);
        if (!result.participant) {
            return res.status(result.status).json({success: false, message: result.message});
        }
        await result.participant.update({player_name: playerName, team_name: teamName});
        return res.status(200).json({success: true, message: 'Participant updated', data: result.participant});
    } catch (error) {
        console.error(`Error with updating participant ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_record = async (req, res) => {
    try {
        const result = await findEditableParticipant(req);
        if (!result.participant) {
            return res.status(result.status).json({success: false, message: result.message});
        }
        const leagueId = result.participant.league_id;
        await sequelize.transaction(async (transaction) => {
            const completedMatches = await League_Matches.count({
                where: {league_id: leagueId, status: 'completed'},
                transaction,
            });
            if (completedMatches) {
                const error = new Error('Participants cannot be removed after results have been recorded');
                error.status = 409;
                throw error;
            }
            await League_Matches.destroy({where: {league_id: leagueId}, transaction});
            await League_Point.destroy({where: {participant_id: result.participant.id}, transaction});
            await result.participant.destroy({transaction});
            const remainingParticipants = await League_Participant.findAll({where: {league_id: leagueId}, transaction});
            const league = await League.findByPk(leagueId, {transaction});
            if (remainingParticipants.length === league.participants) {
                await League_Matches.bulkCreate(
                    Match_generation(remainingParticipants, league, league.match_interval),
                    {transaction},
                );
            }
        });
        return res.status(200).json({success: true, message: 'Participant deleted'});
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({success: false, message: error.message});
        }
        console.error(`Error with deleting participant ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};
