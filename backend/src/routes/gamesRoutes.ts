import express from "express";
import Game from "../DB/games.js";
import User from "../DB/userSchema.js";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_POSITION } from "../socket.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Games routes");
});
router.get("/get-game/:id", async (req, res) => {
  const { id } = req.params;
  const game = await Game.findById(id);
  res.json(game);
});
router.get("/get-games/:userId", async (req, res) => {
  const { userId } = req.params;
  const games = await Game.find({
    $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
  });
  res.json(games);
});

router.get("/get-games-by-user/:userId", async (req, res) => {
  const { userId } = req.params;
  const games = await Game.find({
    $or: [
      { whitePlayer: userId, isOngoing: false },
      { blackPlayer: userId, isOngoing: false },
    ],
  });
  const gamesWithPlayers = await Promise.all(
    games.map(async (game) => {
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
    }),
  );
  res.json(gamesWithPlayers);
});

router.post("/create-game", async (req, res) => {
  const { userId, timeControl }: { userId: string; timeControl: string } =
    req.body;
  const game = new Game({
    whitePlayer: userId,
    blackPlayer: null,
    timeControl: timeControl,
    invitationType: "qr",
    roomId: uuidv4(),
    currentFen: DEFAULT_POSITION,
    isWhiteTurn: true,
    isOngoing: true,
  });
  await game.save();

  const roomId = game.roomId;
  const url = `chess://room/${roomId}?timeControl=${timeControl}`;

  res.json({
    url,
    roomId,
    timeControl,
  });
});

router.post("/join-game-url", async (req, res) => {
  const { userId, gameUrl }: { userId: string; gameUrl: string } = req.body;

  if (!userId || !gameUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const id = gameUrl.split("/")[2].split("?")[0];

  if (!id) {
    res.status(400).json({ error: "Invalid game URL" });
    return;
  }

  const game = await Game.findById(id);

  if (!game) {
    res.status(404).json();
  }

  if (!game?.blackPlayer) {
    res.status(400).json({ error: "Game is not available" });
  }

  res.status(200).json({ message: "valid url" });
});

export default router;
