import {Sequelize} from 'sequelize';

const sequelize = new Sequelize('pes', 'postgres', 'yugah2005@', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

export default sequelize;