import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { registerSocketHandlers } from './sockets/index.js';

validateEnv();
const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, credentials: true } });
app.set('io', io);
registerSocketHandlers(io);

await connectDatabase();
server.listen(process.env.PORT || 5000, () => console.log(`EcoCycle API on :${process.env.PORT || 5000}`));
