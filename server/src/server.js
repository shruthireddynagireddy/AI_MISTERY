import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';
const port=Number(process.env.PORT)||4000;
await connectDatabase();
app.listen(port,()=>console.info(`AI Mystery Room API listening on ${port}`));
