import sequelize from "../../database/config.js";
import { DataTypes } from "sequelize";

const League_Participant = sequelize.define('league_participants', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    league_id: {
        type: DataTypes.UUID,
        references: {
            model: 'leagues', 
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

export default League_Participant;