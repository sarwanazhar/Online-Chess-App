import { Server } from "socket.io";
import { Chess } from "chess.js";
import Game from "./DB/games.js";
import { v4 as uuidv4 } from 'uuid';

let waitingUsers = new Map<string, { userId: string, socket: any, timeControl: string }>();
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
let activeGames = new Map()

export const socketFunctions = (io: Server) => {
    io.on('connection', (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", ({userId, timeControl}) => {
            console.log("A user joined:", userId);
            waitingUsers.set(socket.id, { userId, socket, timeControl });

            if (waitingUsers.size >= 2) {
                const iterator = waitingUsers.values();
                const player1 = iterator.next().value;
                const player2 = iterator.next().value;

                if (!player1 || !player2) {
                    return;
                }

                waitingUsers.delete(player1.socket.id);
                waitingUsers.delete(player2.socket.id);

                const roomId = uuidv4();

                player1.socket.join(roomId);
                player2.socket.join(roomId);

                const createGame = async () => {
                    const game = new Game({
                        roomId,
                        whitePlayer: player1.userId,
                        blackPlayer: player2.userId,
                        currentFen: DEFAULT_POSITION,
                        isWhiteTurn: true,
                        whitePlayerSocketId: player1.socket.id,
                        blackPlayerSocketId: player2.socket.id,
                        timeControl: player1.timeControl,
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
                    })
                }
                createGame();
            }
        })

        socket.on("move", async ({userId, roomId, move}) => {
            console.log(move ,userId, roomId);
            const game = await Game.findOne({roomId});
            console.log(game);
            if(!game) {
                return;
            }
            let team = game.whitePlayer == userId ? "white" : "black";
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
                } catch (e) {
                    console.log(e);
                }
                if (typeof chess.move(move) === "object") {
                    if(chess.isCheckmate()){
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "white",
                        })
                    } else if(chess.isStalemate()){
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                    }else if (chess.isDraw()){
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                    } else {
                        game.currentFen = chess.fen();
                        console.log(chess.fen());
                        game.isWhiteTurn = false;
                        await game.save();
                        io.to(roomId).emit("move", {
                            roomId,
                            currentFen: game.currentFen,
                            isWhiteTurn: game.isWhiteTurn,
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
                if (typeof chess.move(move) === "object") {
                    if(chess.isCheckmate()){
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "black",
                        })
                    } else if(chess.isStalemate()){
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                    }else if (chess.isDraw()){
                        io.to(roomId).emit("gameOver", {
                            roomId,
                            winner: "draw",
                        })
                    } else {
                        game.currentFen = chess.fen();
                        game.isWhiteTurn = true;
                        await game.save();
                        io.to(roomId).emit("move", {
                            roomId,
                            currentFen: game.currentFen,
                            isWhiteTurn: game.isWhiteTurn,
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
                })
            } else if (team === "black") {
                socket.join(roomId)
                socket.emit("rejoined", {
                    roomId,
                    currentFen: game.currentFen,
                    isWhiteTurn: game.isWhiteTurn,
                    blackPlayer: game.blackPlayer,
                    whitePlayer: game.whitePlayer,
                })
            }
        })
        
        socket.on("disconnect", async () => {
            console.log("A user disconnected:", socket.id);
            const whiteGame = await Game.findOne ({whitePlayerSocketId: socket.id});
            const blackGame = await Game.findOne ({blackPlayerSocketId: socket.id});
            if(whiteGame){
                const timeOutId = setTimeout(async () => {
                    await whiteGame.updateOne({$set: {isOngoing: false, winner: whiteGame.blackPlayer, whitePlayerSocketId: null, blackPlayerSocketId: null}})
                    io.to(whiteGame.roomId).emit("gameOver", {
                        roomId: whiteGame.roomId,
                        winner: whiteGame.blackPlayer,
                    })
                }, 60000)
                activeGames.set(whiteGame.roomId, timeOutId)
            }
            if(blackGame){
                const timeOutId = setTimeout(async () => {
                    await blackGame.updateOne({$set: {isOngoing: false, winner: blackGame.whitePlayer, whitePlayerSocketId: null, blackPlayerSocketId: null}})
                    io.to(blackGame.roomId).emit("gameOver", {
                        roomId: blackGame.roomId,
                        winner: blackGame.whitePlayer,
                    })
                }, 60000)
                activeGames.set(blackGame.roomId, timeOutId)
            }
        })
    })
}