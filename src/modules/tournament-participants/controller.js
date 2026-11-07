import Tournament_Participant from "./schema.js";
import Tournament from "../tournaments/schema.js";

export const add_participant = async(req, res) => {
    try {
        const {tournament_id, player_name, team_name} = req.body;
        if(!tournament_id || !player_name || !team_name){
            return res.status(400).json({success: false, message: 'Missing Fields'});
        };
        const user_id = req.user.id;
        const torunament = await Tournament.findByPk(tournament_id);
        if(torunament){
            return res.status(404).json({success: false, message: 'Inavlid Tournament ID'});
        };
        const participants = await Tournament_Participant.findAll({where: {tournament_id: torunament.id}});
        if(torunament.participant = participants.length){
            return res.status(400).json({success: false, message: 'Maximum Participants Reached'})
        };
        const participant = await Tournament_Participant.create({tournament_id: torunament.id, user_id, player_name, team_name});
        if(!participant){
            return res.status(500).json({success: false, message: 'Failed To Add Participant'});
        };
        return res.status(200).json({success: true, message: 'Participant Added'});
    } catch (error) {
        console.error(`Error with adding participants ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_participants_by_torunaments = async (req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide tournament id'});
        };
        const participants = await Tournament_Participant.findAll({where:{tournament_id: id}});
        if(!participants || participants.length === 0){
            return res.status(404).json({success: false, message: 'No Participant Fetched'});
        };
        return res.status(200).json({success: true, message: 'Participants Fetched', data: participants})
    } catch (error) {
        console.error(`Error with getting participant by tournament id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_user_participations = async(req, res) => {
    try {
        const user_id = req.user.id;
        if(!user_id){
            return res.status(400).json({success: false, message: 'Please Login and Try again'});
        };
        const participations = await Tournament_Participant.findAll({where:{user_id: user_id}});
        if(!participations || participations.length === 0){
            return res.status(404).json({success: false, message: 'No Participations Fetched'});
        };
        return res.status(200).json({success: true, message: 'User Participations', data: participations})
    } catch (error) {
        console.error(`Error with getting user participations ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const get_by_id = async(req, res ) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'});
        };
        const participation = await Tournament_Participant.findByPk(id);
        if(!participation){
            return res.status(404).json({success: false, message: 'Inavlid ID'});
        };
        return res.status(200).json({success: true, message: 'Participant Fetched', data: participation})
    } catch (error) {
        console.error(`Error with getting record by Id ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const update_record = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'});
        };
        const {player_name, team_name} = req.body;
        const participation = await Tournament_Participant.findByPk(id);
        if(!participation){
            return res.status(404).json({success: false, message: 'Inavlid ID'});
        };
        const updated_participant = await participation.update({player_name, team_name});
        if(!updated_participant){
            return res.status(500).json({success: false, message: 'Failed to update participant'});
        };
        return res.status(200).json({success: true, message: 'Updated Record'});
    } catch (error) {
        console.error(`Error with updating record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const delete_record = async(req, res) => {
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).json({success: false, message: 'Provide record id'});
        };
        const participation = await Tournament_Participant.findByPk(id);
        if(!participation){
            return res.status(404).json({success: false, message: 'Inavlid ID'});
        };
        await participation.destroy();
        return res.status(200).json({success: true, message: 'Deleted Participant'});
    } catch (error) {
        console.error(`Error with deleting record ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};