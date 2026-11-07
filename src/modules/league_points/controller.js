import League_Point from "./schema";
import League from '../leagues/schema.js';

export const add_match_results = async(req, res) => {
    try {
        //the match is an object that's an entry in the match table it comes from updating scores by league owner
        const {match} = req.body;
        if(!match){
            return res.status(400).json({success: false, message: 'Missing Match Entry'});
        };
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide League ID'});
        };
        const team_one = await League_Point.findOne({where:{league_id: id, participant_id: match.participant_a}});
        const team_two = await League_Point.findOne({where:{league_id: id, participant_id: match.participant_b}});
        let total_points;
        let matches_played;
        let matches_won;
        let matches_drawn;
        let matches_lost;
        let total_p
        let matches_w
        let matches_p
        let matches_l
        let matches_d
        if(match.winning_id === team_one.participant_id){
            total_points = team_one.total_points + 3
            matches_won = team_one.matches_won + 1
            matches_played = team_one.matches_played + 1
        } else if (match.winning_id === team_two.participant_id) {
            total_p = team_two.total_points + 3
            matches_w = team_two.matches_won + 1
            matches_p = team_two.matches_played + 1
        } else if (match.winning_id ===  null){
            total_points = team_one.total_points + 1
            matches_drawn = team_one.matches_drawn + 1
            matches_played = team_one.matches_played + 1
            total_p = team_two.total_points + 1
            matches_d = team_two.matches_drawn + 1
            matches_p = team_two.matches_played + 1
        } else if (match.winning_id !== team_one.participant_id) {
            total_points = team_one.total_points + 0
            matches_played = team_one.matches_played + 1
            matches_lost = team_one.matches_lost + 1
        } else if (match.winning_id !== team_two.participant_id) {
            total_p = team_two.total_points + 0
            matches_p = team_two.matches_played + 1
            matches_l = team_two.matches_lost + 1
        }
        const updated_team_a = await team_one.update({matches_played, matches_won, matches_lost, matches_drawn, total_points});
        const updated_team_b = await team_two.update({matches_played: matches_p, matches_won: matches_w, matches_lost: matches_l, matches_drawn: matches_d, total_points: total_p});
        if(!updated_team_a || !updated_team_b){
            return res.status(500).json({success: false, message: 'Failed to update the League Points Table'})
        };
        return res.status(200).json({success: true, message: 'League Table Updated'});
    } catch (error) {
        console.error(`Error with adding match results to League partcipant table ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_league_table = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide League Id'});
        };
        const points = await League_Point.findAll({where:{league_id: id}});
        if(!points || points.length === 0){
            return res.status(404).json({success: false, message: 'Missing League Table'});
        };
        return res.status(200).json({success: true, message: 'League Table Fetched', data: points})
    } catch (error) {
        console.error(`Error with getting league table ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'})
    }
};

export const toggle_status = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide League ID'});
        };
        const league = await League.findByPk(id);
        if(!league){
            return res.status(404).json({success: false, message: 'Invalid League ID'});
        };
        const league_table = await League_Point.findAll({where:{league_id: league.id}});
        if(!league_table || league_table.length === 0){
            return res.status(404).json({success: false, message: "Missing League Table"});
        };
        for (const row of league_table){
            const matches_to_play = league.participant - 1;
            if(row.matches_played = matches_to_play){
                const updated_row = await row.update({status: 'complete'});
            };
        };
        return res.status(200).json({success: true, message: 'League Table status completed'});
    } catch (error) {
        console.error(`Error with toggling the league's status ${error}`);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
};