import sequelize from "../../database/config.js";
import { DataTypes } from "sequelize";

const League_Point = sequelize.define('league_points', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:  false
    },
    competition_id: {
        type: DataTypes.UUID,
        references: {
            model: 'leagues',
            key: 'id',
        },
        allowNull: false
    },
    participant_id: {
        type: DataTypes.UUID,
        references: {
            model: 'league_participants',
            key: 'id'
        },
        allowNull: false
    },
    matches_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    matches_won: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    matches_lost: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    matches_drawn: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    total_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    league_status: {
        type: DataTypes.ENUM('incomplete', 'complete'),
        defaultValue: 'incomplete',
        allowNull: false
    }
}, {timestamps: true});

export default League_Point;