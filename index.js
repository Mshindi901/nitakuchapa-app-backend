import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './src/database/connect.js'

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());

app.listen(port, async () => {
    await connectDB();
    console.log('Server is Running')
});