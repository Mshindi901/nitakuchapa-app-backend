import sequelize from "../../database/config.js";
import { DataTypes } from "sequelize";

const Tournament_Participant = sequelize.define('tournament_participants', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    tournament_id: {
        type: DataTypes.UUID,
        references: {
            model: 'tournaments', 
            key: 'id'
        },
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: true
    },
    player_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    team_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {timestamps: true});

export default Tournament_Participant;