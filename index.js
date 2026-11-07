import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './src/database/connect.js'

import UserRoutes from './src/modules/users/routes.js';
import CompetitionRoutes from './src/modules/competitions/routes.js';
import CompetitionParticipantRoutes from './src/modules/participants/routes.js';
import CompetitionMatches from './src/modules/matches/routes.js';
import CompetitionTableRoutes from './src/modules/points_table/routes.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/api', UserRoutes);
app.use('/api', CompetitionRoutes);
app.use('/api', CompetitionParticipantRoutes);
app.use('/api', CompetitionMatches);
app.use('/api', CompetitionTableRoutes);

app.listen(port, async () => {
    await connectDB();
    console.log('Server is Running')
});