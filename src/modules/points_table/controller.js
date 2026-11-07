import sequelize from "../../database/config.js";
import League_Point from "./schema.js";
import Competition from '../competitions/schema.js';
import League_Participant from '../participants/schema.js';
import League_Matches from '../matches/schema.js';

export const add_match_results = async (req, res) => {
    try {
        const postedMatch = req.body.match;
        const leagueId = req.params.id && req.params.id !== 'id'
            ? req.params.id
            : postedMatch?.league_id ?? req.body.league_id;
        if (!postedMatch || !leagueId) {
            return res.status(400).json({success: false, message: 'Provide the updated match and competition ID'});
        }

        const league = await Competition.findOne({where: {id: leagueId, owner: req.user.id}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found or you are not its owner'});
        }
        const match = await League_Matches.findOne({
            where: {id: postedMatch.id, league_id: league.id, status: 'completed'},
        });
        if (!match) {
            return res.status(409).json({success: false, message: 'The completed match record was not found'});
        }
        if (match.participant_a !== postedMatch.participant_a ||
            match.participant_b !== postedMatch.participant_b ||
            match.participant_a_score !== Number(postedMatch.participant_a_score) ||
            match.participant_b_score !== Number(postedMatch.participant_b_score)) {
            return res.status(409).json({success: false, message: 'The submitted match does not match the saved result'});
        }

        const updatedTable = await sequelize.transaction(async (transaction) => {
            const participants = await League_Participant.findAll({
                where: {league_id: league.id},
                transaction,
            });
            const tableRows = await League_Point.findAll({
                where: {competition_id: league.id},
                transaction,
            });
            const rowByParticipant = new Map(tableRows.map((row) => [row.participant_id, row]));
            const stats = new Map(participants.map((participant) => [participant.id, {
                matches_played: 0,
                matches_won: 0,
                matches_lost: 0,
                matches_drawn: 0,
                total_points: 0,
            }]));
            const completedMatches = await League_Matches.findAll({
                where: {league_id: league.id, status: 'completed'},
                transaction,
            });

            for (const completedMatch of completedMatches) {
                const scoreA = completedMatch.participant_a_score;
                const scoreB = completedMatch.participant_b_score;
                const statsA = stats.get(completedMatch.participant_a);
                const statsB = stats.get(completedMatch.participant_b);
                if (scoreA === null || scoreB === null || !statsA || !statsB) continue;

                statsA.matches_played += 1;
                statsB.matches_played += 1;
                if (scoreA === scoreB) {
                    statsA.matches_drawn += 1;
                    statsB.matches_drawn += 1;
                    statsA.total_points += 1;
                    statsB.total_points += 1;
                } else if (scoreA > scoreB) {
                    statsA.matches_won += 1;
                    statsB.matches_lost += 1;
                    statsA.total_points += 3;
                } else {
                    statsB.matches_won += 1;
                    statsA.matches_lost += 1;
                    statsB.total_points += 3;
                }
            }

            const results = [];
            for (const [participantId, participantStats] of stats) {
                const row = rowByParticipant.get(participantId);
                if (!row) {
                    const error = new Error('A participant is missing from the competition table');
                    error.status = 409;
                    throw error;
                }
                await row.update(participantStats, {transaction});
                results.push(row);
            }
            return results;
        });
        return res.status(200).json({success: true, message: 'Competition table updated', data: updatedTable});
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({success: false, message: error.message});
        }
        console.error(`Error with updating competition points ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_league_table = async (req, res) => {
    try {
        const competition = await Competition.findByPk(req.params.id);
        if (!competition) {
            return res.status(404).json({success: false, message: 'Competition not found'});
        }
        const points = await League_Point.findAll({
            where: {competition_id: competition.id},
            order: [['total_points', 'DESC'], ['matches_won', 'DESC']],
        });
        return res.status(200).json({success: true, message: 'Competition table fetched', data: points});
    } catch (error) {
        console.error(`Error with getting competition table ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const toggle_status = async (req, res) => {
    try {
        const league = await Competition.findOne({where: {id: req.params.id, owner: req.user.id}});
        if (!league) {
            return res.status(404).json({success: false, message: 'Competition not found or you are not its owner'});
        }
        const table = await League_Point.findAll({where: {competition_id: league.id}});
        if (!table.length) {
            return res.status(404).json({success: false, message: 'Competition table is empty'});
        }
        const matchesToPlay = league.participants - 1;
        const isComplete = table.every((row) => row.matches_played >= matchesToPlay);
        if (!isComplete) {
            return res.status(409).json({success: false, message: 'Not all participants have completed their fixtures'});
        }
        await League_Point.update(
            {league_status: 'complete'},
            {where: {competition_id: league.id}},
        );
        const updatedTable = await League_Point.findAll({where: {competition_id: league.id}});
        return res.status(200).json({success: true, message: 'Competition table completed', data: updatedTable});
    } catch (error) {
        console.error(`Error with completing the competition table ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};
