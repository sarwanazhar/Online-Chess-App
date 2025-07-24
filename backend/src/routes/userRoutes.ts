import express from 'express';
import User from '../DB/userSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Game from '../DB/games.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json(users);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(200).json({
    message: "User fetched successfully",
    user: {
      name: user?.name,
      email: user?.email,
      id: user?._id,
    }
  });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({$or: [{email: email}, {username: name}]});
  if (existingUser) {
    res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, elo: 1000 });
  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  const user = await User.findOne({$or: [{email: emailOrUsername}, {username: emailOrUsername}]});
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
  } else {
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (isPasswordValid) {
      const token = jwt.sign({ email: user.email, name: user.name, id: user._id }, process.env.JWT_SECRET || '');
      res.status(200).json({ message: 'Login successful', user: {
        name: user.name,
        email: user.email,
        id: user._id,
        token: token,
      } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  }
})

router.post('/rating/:id', async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(200).json({
    message: "User fetched successfully",
    rating: user?.elo,
  });
})

router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const rating = user?.elo;
  const games = await Game.find({$or: [{whitePlayer: id}, {blackPlayer: id}]});
  const totalGames = games.length;
  const totalWins = games.filter((game) => game.winner != null && game.winner.toString() === id).length;
  res.status(200).json({
    message: "User fetched successfully",
    rating: rating?.toString(),
    totalGames: totalGames.toString(),
    totalWins: totalWins.toString(),
  });
})

export default router;