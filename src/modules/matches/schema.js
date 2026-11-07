import sequelize from "../../database/config.js";
import { DataTypes} from "sequelize";


const League_Matches = sequelize.define('league_matches', {
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
            key: 'id',
        },
        allowNull: false
    },
    participant_a: {
        type: DataTypes.UUID,
        references: {
            model: 'league_participants',
            key: 'id'
        },
        allowNull: false
    },
    participant_b: {
        type: DataTypes.UUID,
        references: {
            model: 'league_participants',
            key: 'id',
        },
        allowNull: false
    },
    round: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    schedule_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    cancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue:  false,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'ongoing', 'completed'),
        defaultValue: 'pending',
        allowNull: false
    },
    participant_a_score: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    participant_b_score: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    winner_id: {
        type: DataTypes.UUID,
        references: {
            model: 'league_participants',
            key: 'id'
        },
        allowNull: true
    }
}, {timestamps: true});

export default League_Matches;