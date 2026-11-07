import sequelize from '../../database/config.js';
import { DataTypes } from 'sequelize';

const League = sequelize.define('leagues', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    owner: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: false
    },
    share_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('league', 'tournament'),
        allowNull: false
    },
    participants: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    match_interval: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    start_date: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_of_days: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
    }
}, {timestamps: true});

export default League;