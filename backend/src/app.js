import express from 'express';
import authRoutes from "./routes/auth.routes.js"
import songRoutes from "./routes/song.routes.js"
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv'

dotenv.config()

const app = express();
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

/* POST /auth/register */
/* POST /auth/login */
app.use('/auth',authRoutes)



/* POST /songs/upload */
/* GET /songs/get-songs */
/* GET /songs/get-song/:mama */
/* GET /songs/search-songs */
app.use('/songs', songRoutes);

/* POST /playlists/create */
/* GET /playlists/user-playlists */
/* POST /playlists/:playlistId/add-song/:songId */
/* DELETE /playlists/:playlistId/remove-song/:songId */
/* DELETE /playlists/:playlistId */



export default app;