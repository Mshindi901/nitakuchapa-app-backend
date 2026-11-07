import League_Participant from "./schema.js";
import League from "../competitions/schema.js";
import League_Point from "../points_table/schema.js";

export const add_participant = async(req, res) => {
    try {
        const {player_name, team_name} = req.body;
        if(player_name || !team_name){
            return res.status(400).json({success: false, message: 'Missing Fields required'});
        };
        const user_id = req.user.id;
        const {shareId} = req.params;
        if(!shareId){
            return res.status(400).json({success: false, message: 'Provide Share code'})
        }
        const league = await League.findOne({where: {share_code: shareId, status: 'active'}});
        if(!league){
            return res.status(404).json({success: false, message: 'Invalid League id'});
        };
        const league_participants = await League_Participant.findAll({where:{league_id: league_id}});
        if(league.participant = league_participants.leghth){
            return res.status(400).json({success: false, message: 'Maximum Participants Reached'});
        };
        const participant = await League_Participant.create({league_id: league.id, user_id: user_id, player_name, team_name});
        if(!participant){
            return res.status(500).json({success: false, message: "Failed to add new participant"});
        };
        const new_league_point = await League_Point.create({league_id: league.id, participant_id: participant.id});
        if(!new_league_point){
            return res.status(500).json({success: false, message: 'Participant Created, failed to add participant to league table'});
        };
        return res.status(200).json({success: true, message: 'Added Participant and added them to League table'});
    } catch (error) {
        console.error(`Error with adding new league participant ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_league_participants = async(req, res) => {
    try {
        const {league_id} = req.params;
        if(!league_id){
            return res.status(400).json({success: false, message: 'PLese provide league id'});
        };
        const partcipants = await League_Participant.findAll({where: {league_id: league_id}});
        if(!partcipants || partcipants.length === 0){
            return res.status(404).json({success: false, message: 'No Participants found'});
        };
        return res.status(200).json({success: true, message: 'Participants Fetched', data: partcipants});
    } catch (error) {
        console.error(`Error with getting league participants ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_participation = async(req, res) => {
    try {
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'No user id provided'});
        };
        const participations = await League_Participant.findAll({where:{user_id: user_id}});
        if(!participations || participations.length === 0){
            return res.status(404).json({success: false, message: 'No Participation FOund'});
        };
        return res.status(200).json({success: true, message: 'Participations Fetched', data: participations});
    } catch (error) {
        console.error(`Error with getting the league participations of user ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_by_id = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide Id'});
        };
        const participant = await League_Participant.findByPk(id);
        if(!participant){
            return res.status(404).json({success: false, message: 'No Participant Found'});
        };
        return res.status(200).json({success: true, message: 'Participant Fetched', data: participant});
    } catch (error) {
        console.error(`Error with getting record by id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_record = async(req, res) => {
    try {
        const {id} = req.params;
        const {player_name, team_name} = req.body;
        if(!player_name || !team_name){
            return res.status(400).json({success: false, message: 'Missing Fields'});
        };
        const participant = await League_Participant.findByPk(id);
        if(!participant){
            return res.status(404).json({success: false, message: 'No Participant Found'});
        };
        const updated_participant = await participant.update({player_name, team_name});
        if(!updated_participant){
            return res.status(500).json({success: false, message: 'Failed To update record'})
        };
        return res.status(200).json({success: true, message: 'Updated Participant'});
    } catch (error) {
        console.error(`Error with updating record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_record = async (req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide Id'});
        };
        const participant = await League_Participant.findByPk(id);
        if(!participant){
            return res.status(404).json({success: false, message: 'No Participant Found'});
        };
        await participant.destroy();
        return res.status(200).json({success: true, message: 'Deleted Participant'});
    } catch (error) {
        console.error(`Error with deleting record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Erorr'});
    }
};