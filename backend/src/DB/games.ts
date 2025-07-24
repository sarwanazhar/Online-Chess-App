import mongoose from "mongoose";

const moveSchema = new mongoose.Schema({
    move: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        enum: ['white', 'black'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const gameSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    whitePlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    blackPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    isOngoing: {
        type: Boolean,
        default: true,
    },
    finalFen: {
        type: String,
        default: '',
    },
    moves: [moveSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    currentFen: {
        required: true,
        type: String,
    },
    isWhiteTurn: {
        required: true,
        type: Boolean,
        default: true,
    },
    whitePlayerSocketId: {
        type: String,
        default: null,
    },
    blackPlayerSocketId: {
        type: String,
        default: null,
    },
    timeControl: {
        type: String,
        required: true,
    },
    whiteTimeRemaining: {
        type: Number,
        required: true,
    },
    blackTimeRemaining: {
        type: Number,
        required: true,
    },
    timeIncrement: {
        type: Number,
        required: true,
    },
    lastMoveTime: {
        type: Number,
        required: true,
    },
    whiteEloChange: {
        type: Number,
        default: 0,
    },
    blackEloChange: {
        type: Number,
        default: 0,
    },
    whiteElo: {
        type: Number,
        required: true,
    },
    blackElo: {
        type: Number,
        required: true,
    },
    invitationType: {
        type: String,
        enum: ['matchmaking', 'qr'],
        default: 'matchmaking',
    }    
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
