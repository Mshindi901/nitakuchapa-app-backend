import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './src/database/connect.js'

import UserRoutes from './src/modules/users/routes.js';
import CompetitionRoutes from './src/modules/competitions/routes.js';
import CompetitionParticipantRoutes from './src/modules/participants/routes.js';
import CompetitionMatches from './src/modules/matches/routes.js';
import CompetitionTableRoutes from './src/modules/points_table/routes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', UserRoutes);
app.use('/api', CompetitionRoutes);
app.use('/api', CompetitionParticipantRoutes);
app.use('/api', CompetitionMatches);
app.use('/api', CompetitionTableRoutes);

async function startServer() {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer().catch((error) => {
    console.error(`Server failed to start ${error}`);
    process.exitCode = 1;
});