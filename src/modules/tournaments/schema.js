import sequelize from "../../database/config.js";
import { DataTypes } from "sequelize";

const Tournament = sequelize.define('tournaments', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique:true,
        allowNull: false
    },
    owner: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: false
    },
    participants: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    match_intervals: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    no_of_days: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
    }
}, {timestamps: true});

export default Tournament;