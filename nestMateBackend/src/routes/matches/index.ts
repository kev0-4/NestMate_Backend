import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { createMatch } from './createMatch';
import { getMatches } from './getMatches';
import { updateMatchStatus } from './updateMatchStatus';
import { getMatchById } from "./getMatchesByid";
import { filterMatches } from './filterMatches';


const matchRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
}>();

matchRouter.post('/', authMiddleware,createMatch);
matchRouter.get('/', authMiddleware,getMatches);
matchRouter.get('/:matchId', authMiddleware,getMatchById)
matchRouter.put('/:matchId', authMiddleware,updateMatchStatus);
matchRouter.get('/filter', filterMatches);


export default matchRouter