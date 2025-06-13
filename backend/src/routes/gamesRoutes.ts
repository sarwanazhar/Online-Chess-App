import express from 'express';
import Game from '../DB/games.js';

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

export default router;