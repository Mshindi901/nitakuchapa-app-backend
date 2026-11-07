import sequelize from './config.js';

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        await sequelize.sync({alter: true});
        console.log('Models synchronized successfully');
    } catch (error) {
        console.error(`Error connecting to the database ${error}`);
        throw error;
    }
};