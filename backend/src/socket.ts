import { Server } from "socket.io";
import { Chess } from "chess.js";
import Game from "./DB/games.js";
import { v4 as uuidv4 } from 'uuid';
import calculateElo from "./libs/calculateElo.js";
import User from "./DB/userSchema.js";

let waitingUsers = new Map<string, { userId: string, socket: any, timeControl: string }>();
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
let activeGames = new Map()

// Time control settings (in milliseconds)
const TIME_CONTROLS = {
    'bullet': { initial: 60000, increment: 0 },      // 1 minute
    'blitz': { initial: 300000, increment: 0 },     // 5 minutes
    'rapid': { initial: 600000, increment: 0 },     // 10 minutes
    'classical': { initial: 1800000, increment: 0 } // 30 minutes
};

export const socketFunctions = (io: Server) => {
    io.on('connection', (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", ({userId, timeControl}) => {
            console.log("A user joined:", userId);
            waitingUsers.set(socket.id, { userId, socket, timeControl });

            if(waitingUsers.size >= 2){

            // Find a player with matching time control
            let matchedPlayer = null;
            for (const [socketId, player] of waitingUsers.entries()) {
                if (socketId !== socket.id && player.timeControl == timeControl) {
                    matchedPlayer = player;
                    break;
                }
            }

            if (matchedPlayer) {
                // Remove both players from waiting list
                waitingUsers.delete(socket.id);
                waitingUsers.delete(matchedPlayer.socket.id);

                const roomId = uuidv4();

                socket.join(roomId);
                matchedPlayer.socket.join(roomId);

                const createGame = async () => {
                    const whiteElo = await User.findById(userId);
                    const blackElo = await User.findById(matchedPlayer.userId);
                    console.log(whiteElo,blackElo);
                    const timeSettings = TIME_CONTROLS[timeControl as keyof typeof TIME_CONTROLS];
                    const game = new Game({
                        roomId,
                        whitePlayer: userId,
                        blackPlayer: matchedPlayer.userId,
                        currentFen: DEFAULT_POSITION,
                        isWhiteTurn: true,
                        whitePlayerSocketId: socket.id,
                        blackPlayerSocketId: matchedPlayer.socket.id,
                        timeControl: timeControl,
                        whiteTimeRemaining: timeSettings.initial,
                        blackTimeRemaining: timeSettings.initial,
                        timeIncrement: timeSettings.increment,
                        lastMoveTime: Date.now(),
                        whiteElo: whiteElo?.elo,
                        blackElo: blackElo?.elo,
                    })
                    await game.save();
                    game.populate("whitePlayer blackPlayer");
                    console.log(game);
                    io.to(roomId).emit("gameStart", {
                        roomId,
                        whitePlayer: game.whitePlayer,
                        blackPlayer: game.blackPlayer,
                        currentFen: game.currentFen,
                        isWhiteTurn: game.isWhiteTurn,
                        timeControl: timeControl,
                        whiteTimeRemaining: game.whiteTimeRemaining,
                        blackTimeRemaining: game.blackTimeRemaining,
                    })
                }
                createGame();
            }
        }
        })

        socket.on("move", async ({userId, roomId, move}) => {
            console.log(move ,userId, roomId);
            const game = await Game.findOne({roomId});
            console.log(game);
            if(!game) {
                return;
            }
            let team = game.whitePlayer.toString() === userId ? "white" : "black";
            console.log(team);
            if(team === "white" && !game.isWhiteTurn){
                return;
            }
            if(team === "black" && game.isWhiteTurn){
                return;
            }
            if(team === "white" && game.isWhiteTurn){
                console.log("white")
                const chess = new Chess();
                try {
                    chess.load(game.currentFen);
                    console.log(chess.fen());
                } catch (e) {
                    console.log(e);
                }
                if (typeof chess.move(move) === "object") {
                    console.log("move")
                    const currentTime = Date.now();
                    const timeElapsed = currentTime - game.lastMoveTime;
                    game.whiteTimeRemaining = Math.max(0, game.whiteTimeRemaining - timeElapsed + game.timeIncrement);
                    game.lastMoveTime = currentTime; 
                    console.log(game.whiteTimeRemaining);
                    if(game.whiteTimeRemaining <= 0){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "white");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "black",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    }
                    if(chess.isCheckmate()){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "white");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "white",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    } else if(chess.isStalemate()){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "draw");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    }else if (chess.isDraw()){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "draw");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    } else {
                        game.currentFen = chess.fen();
                        console.log(chess.fen());
                        game.isWhiteTurn = false;
                        game.lastMoveTime = currentTime;
                        await game.save();
                        io.to(roomId).emit("move", {
                            roomId,
                            currentFen: game.currentFen,
                            isWhiteTurn: game.isWhiteTurn,
                            whiteTimeRemaining: game.whiteTimeRemaining,
                            blackTimeRemaining: game.blackTimeRemaining
                        })
                    }
                }
            } else if (team === "black" && !game.isWhiteTurn) {
                const chess = new Chess();
                try {
                    chess.load(game.currentFen);
                } catch (e) {
                    console.log(e);
                }
                console.log(chess.fen());
                if (typeof chess.move(move) === "object") {
                    const currentTime = Date.now();
                    const timeElapsed = currentTime - game.lastMoveTime;
                    game.blackTimeRemaining = Math.max(0, game.blackTimeRemaining - timeElapsed + game.timeIncrement);
                    game.lastMoveTime = currentTime;
                    console.log(game.blackTimeRemaining);
                    if(game.blackTimeRemaining <= 0){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "black");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "white",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    }
                    if(chess.isCheckmate()){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "black");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "black",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    } else if(chess.isStalemate()){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "draw");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    }else if (chess.isDraw()){
                        const {newWhite, newBlack} = calculateElo(game.whiteElo, game.blackElo, "draw");
                        await User.findByIdAndUpdate(game.whitePlayer, {elo: newWhite});
                        await User.findByIdAndUpdate(game.blackPlayer, {elo: newBlack});
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                        game.isOngoing = false;
                        await game.save();
                        return;
                    } else {
                        game.currentFen = chess.fen();
                        game.isWhiteTurn = true;
                        game.lastMoveTime = currentTime;
                        await game.save();
                        io.to(roomId).emit("move", {
                            roomId,
                            currentFen: game.currentFen,
                            isWhiteTurn: game.isWhiteTurn,
                            whiteTimeRemaining: game.whiteTimeRemaining,
                            blackTimeRemaining: game.blackTimeRemaining
                        })
                    }
                }
            }
        })

        socket.on("rejoin", async ({userId, roomId}) => {
            const game = await Game.findOne({roomId, isOngoing: true});
            if(!game){
                return;
            }
            if(activeGames.has(roomId)){
                clearTimeout(activeGames.get(roomId));
                activeGames.delete(roomId);
            }
            const team = game.whitePlayer === userId ? "white" : "black";
            if (team === "white") {
                socket.join(roomId)
                socket.emit("rejoined", {
                    roomId,
                    currentFen: game.currentFen,
                    isWhiteTurn: game.isWhiteTurn,
                    blackPlayer: game.blackPlayer,
                    whitePlayer: game.whitePlayer,
                    whiteTimeRemaining: game.whiteTimeRemaining,
                    blackTimeRemaining: game.blackTimeRemaining
                })
            } else if (team === "black") {
                socket.join(roomId)
                socket.emit("rejoined", {
                    roomId,
                    currentFen: game.currentFen,
                    isWhiteTurn: game.isWhiteTurn,
                    blackPlayer: game.blackPlayer,
                    whitePlayer: game.whitePlayer,
                    whiteTimeRemaining: game.whiteTimeRemaining,
                    blackTimeRemaining: game.blackTimeRemaining
                })
            }
        })
        
        socket.on("disconnect", async () => {
            console.log("A user disconnected:", socket.id);
            const whiteGame = await Game.findOne ({whitePlayerSocketId: socket.id});
            const blackGame = await Game.findOne ({blackPlayerSocketId: socket.id});
            if(whiteGame){
                const timeOutId = setTimeout(async () => {
                    const {newWhite, newBlack} = calculateElo(whiteGame.whiteElo, whiteGame.blackElo, "white");
                    await User.findByIdAndUpdate(whiteGame.whitePlayer, {elo: newWhite});
                    await User.findByIdAndUpdate(whiteGame.blackPlayer, {elo: newBlack});
                    await whiteGame.updateOne({$set: {isOngoing: false, winner: whiteGame.blackPlayer, whitePlayerSocketId: null, blackPlayerSocketId: null}})
                    io.to(whiteGame.roomId).emit("gameOver", {
                        roomId: whiteGame.roomId,
                        winner: whiteGame.blackPlayer,
                    })
                }, 15000) // 15 seconds
                activeGames.set(whiteGame.roomId, timeOutId)
            }
            if(blackGame){
                const timeOutId = setTimeout(async () => {
                    const {newWhite, newBlack} = calculateElo(blackGame.whiteElo, blackGame.blackElo, "black");
                    await User.findByIdAndUpdate(blackGame.whitePlayer, {elo: newWhite});
                    await User.findByIdAndUpdate(blackGame.blackPlayer, {elo: newBlack});
                    await blackGame.updateOne({$set: {isOngoing: false, winner: blackGame.whitePlayer, whitePlayerSocketId: null, blackPlayerSocketId: null}})
                    io.to(blackGame.roomId).emit("gameOver", {
                        roomId: blackGame.roomId,
                        winner: blackGame.whitePlayer,
                    })
                }, 15000) // 15 seconds
                activeGames.set(blackGame.roomId, timeOutId)
            }
        })
    })
}