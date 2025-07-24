import express from 'express';
import Game from '../DB/games.js';
import User from '../DB/userSchema.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Games routes');
});
router.get('/get-game/:id', async (req, res) => {
    const { id } = req.params;
    const game = await Game.findById(id);
    res.json(game);
});
router.get('/get-games/:userId', async (req, res) => {
    const { userId } = req.params;
    const games = await Game.find({
        $or: [
            { whitePlayer: userId },
            { blackPlayer: userId }
        ]
    });
    res.json(games);
});

router.get("/get-games-by-user/:userId", async (req, res) => {
    const { userId } = req.params;
    const games = await Game.find({
        $or: [
            { whitePlayer: userId },
            { blackPlayer: userId }
        ]
    });
    const gamesWithPlayers = await Promise.all(games.map(async (game) => {
        const whitePlayer = await User.findById(game.whitePlayer);
        const blackPlayer = await User.findById(game.blackPlayer);
        const winner = await User.findById(game.winner);
        return {
            id: game._id,
            white: whitePlayer ? whitePlayer.name : null,
            black: blackPlayer ? blackPlayer.name : null,
            result: winner ? winner.name : null,
            timeControl: game.timeControl,
        };
    }));
    res.json(gamesWithPlayers);
});



export default router;