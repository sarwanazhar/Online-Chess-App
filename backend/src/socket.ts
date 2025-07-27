import { Server } from "socket.io";
import { Chess } from "chess.js";
import Game from "./DB/games.js";
import { v4 as uuidv4 } from "uuid";
import calculateElo from "./libs/calculateElo.js";
import User from "./DB/userSchema.js";

let waitingUsers = new Map<
  string,
  { userId: string; socket: any; timeControl: string }
>();
export const DEFAULT_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
// Default ELO score used when a player's ELO is not available
const DEFAULT_ELO = 1200;
// Helper to safely obtain a numeric ELO (falls back to DEFAULT_ELO for null/undefined)
const getSafeElo = (elo?: number | null) => elo ?? DEFAULT_ELO;
let activeGames = new Map();

// Time control settings (in milliseconds)
const TIME_CONTROLS = {
  bullet: { initial: 60000, increment: 0 }, // 1 minute
  blitz: { initial: 300000, increment: 0 }, // 5 minutes
  rapid: { initial: 600000, increment: 0 }, // 10 minutes
  classical: { initial: 600000, increment: 0 }, // 10 minutes
};

export const socketFunctions = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on(
      "joinRoom",
      async ({ roomId, userId }: { roomId: string; userId: string }) => {
        try {
          // Fetch the game document
          const game = await Game.findOne({ roomId });
          if (!game) {
            socket.emit("error", { message: "Room not found" });
            return;
          }

          // Determine which side the joining user should be on
          let joiningSide: "white" | "black";
          if (game.whitePlayer && game.whitePlayer.toString() === userId) {
            joiningSide = "white";
          } else if (
            !game.blackPlayer ||
            game.blackPlayer.toString() === userId
          ) {
            joiningSide = "black";
          } else {
            socket.emit("error", {
              message: "You are not a player in this game",
            });
            return;
          }

          // Join the socket.io room
          socket.join(roomId);

          // Load time-control settings (defaults to blitz if missing)
          const timeSettings =
            TIME_CONTROLS[game.timeControl as keyof typeof TIME_CONTROLS] ??
            TIME_CONTROLS["blitz"];

          // Fetch user & ELO
          const userDoc = await User.findById(userId);

          // Build update payload common for both sides
          const baseUpdates: any = {
            lastMoveTime: Date.now(),
            whiteTimeRemaining: game.whiteTimeRemaining ?? timeSettings.initial,
            blackTimeRemaining: game.blackTimeRemaining ?? timeSettings.initial,
          };

          if (joiningSide === "white") {
            baseUpdates.whitePlayerSocketId = socket.id;
            baseUpdates.whiteElo = userDoc?.elo ?? getSafeElo();
          } else {
            baseUpdates.blackPlayer = userId; // might already be set, harmless
            baseUpdates.blackPlayerSocketId = socket.id;
            baseUpdates.blackElo = userDoc?.elo ?? getSafeElo();
          }

          await Game.updateOne({ roomId }, { $set: baseUpdates });

          // Refresh the game document to get latest values for emitting
          const updatedGame = await Game.findOne({ roomId }).populate(
            "whitePlayer blackPlayer",
          );

          // Inform the joining socket it successfully joined
          socket.emit("joinedRoom", {
            roomId,
            side: joiningSide,
          });

          // If both players are now present, start the game for everyone in the room
          if (
            updatedGame?.whitePlayerSocketId &&
            updatedGame?.blackPlayerSocketId &&
            updatedGame?.blackPlayer // ensure black player assigned
          ) {
            io.to(roomId).emit("gameStart", {
              roomId,
              whitePlayer: updatedGame.whitePlayer?._id?.toString(),
              whitePlayerName: (updatedGame.whitePlayer as any)?.name,
              blackPlayer: updatedGame.blackPlayer?._id?.toString(),
              blackPlayerName: (updatedGame.blackPlayer as any)?.name,
              currentFen: updatedGame.currentFen,
              isWhiteTurn: updatedGame.isWhiteTurn,
              timeControl: updatedGame.timeControl,
              whiteTimeRemaining:
                updatedGame.whiteTimeRemaining ?? timeSettings.initial,
              blackTimeRemaining:
                updatedGame.blackTimeRemaining ?? timeSettings.initial,
            });
          }
        } catch (err) {
          console.error("joinRoom error:", err);
          socket.emit("error", { message: "Internal server error" });
        }
      },
    );

    socket.on(
      "cancelRoom",
      async ({ roomId, userId }: { roomId: string; userId: string }) => {
        try {
          const game = await Game.findOne({ roomId });
          if (!game) return;
          // Allow cancellation only if game not started (no blackPlayer) and the caller is the whitePlayer
          if (!game.blackPlayer && game.whitePlayer?.toString() === userId) {
            await Game.deleteOne({ roomId });
            // Ensure any waiting timers cleared
            if (activeGames.has(roomId)) {
              clearTimeout(activeGames.get(roomId));
              activeGames.delete(roomId);
            }
            socket.leave(roomId);
            console.log(`Room ${roomId} cancelled by white player`);
          }
        } catch (err) {
          console.error("cancelRoom error", err);
        }
      },
    );

    socket.on(
      "join",
      ({ userId, timeControl }: { userId: string; timeControl: string }) => {
        console.log("A user joined:", userId);
        waitingUsers.set(socket.id, { userId, socket, timeControl });

        if (waitingUsers.size >= 2) {
          // Find a player with matching time control
          let matchedPlayer = null;
          for (const [socketId, player] of waitingUsers.entries()) {
            if (
              socketId !== socket.id &&
              player.timeControl === timeControl &&
              player.userId !== userId
            ) {
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
              console.log(whiteElo, blackElo);
              const timeSettings =
                TIME_CONTROLS[timeControl as keyof typeof TIME_CONTROLS];
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
              });
              await game.save();
              game.populate("whitePlayer blackPlayer");
              console.log(game);
              io.to(roomId).emit("gameStart", {
                roomId,
                whitePlayer: game.whitePlayer,
                whitePlayerName: whiteElo?.name,
                blackPlayer: game.blackPlayer,
                blackPlayerName: blackElo?.name,
                currentFen: game.currentFen,
                isWhiteTurn: game.isWhiteTurn,
                timeControl: timeControl,
                whiteTimeRemaining: game.whiteTimeRemaining,
                blackTimeRemaining: game.blackTimeRemaining,
              });
            };
            createGame();
          }
        }
      },
    );

    socket.on(
      "move",
      async ({
        userId,
        roomId,
        move,
      }: {
        userId: string;
        roomId: string;
        move: any;
      }) => {
        console.log(move, userId, roomId);
        const game = await Game.findOne({ roomId });
        console.log(game);
        if (!game) {
          return;
        }
        let team = game.whitePlayer.toString() === userId ? "white" : "black";
        console.log(team);
        if (team === "white" && !game.isWhiteTurn) {
          return;
        }
        if (team === "black" && game.isWhiteTurn) {
          return;
        }
        if (team === "white" && game.isWhiteTurn) {
          console.log("white");
          const chess = new Chess();
          try {
            chess.load(game.currentFen ?? DEFAULT_POSITION);
            console.log(chess.fen());
          } catch (e) {
            console.log(e);
          }
          let moveResult: any;
          try {
            moveResult = chess.move(move);
          } catch (err) {
            console.error("Invalid move received from white side:", move, err);
            // Optionally notify the player that their move was invalid
            socket.emit("invalidMove", { roomId, move });
            return;
          }
          if (typeof moveResult === "object") {
            console.log("move");
            const currentTime = Date.now();
            const timeElapsed =
              currentTime - (game.lastMoveTime ?? currentTime);
            game.whiteTimeRemaining = Math.max(
              0,
              (game.whiteTimeRemaining ?? 0) -
                timeElapsed +
                (game.timeIncrement ?? 0),
            );
            game.lastMoveTime = currentTime;
            console.log(game.whiteTimeRemaining);
            if (game.whiteTimeRemaining <= 0) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "white",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "black",
              });
              game.isOngoing = false;
              await game.save();
              return;
            }
            if (chess.isCheckmate()) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "white",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "white",
              });
              game.isOngoing = false;
              await game.save();
              return;
            } else if (chess.isStalemate()) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "draw",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "draw",
              });
              game.isOngoing = false;
              await game.save();
              return;
            } else if (chess.isDraw()) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "draw",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "draw",
              });
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
                blackTimeRemaining: game.blackTimeRemaining,
                move: {
                  from: move.from,
                  to: move.to,
                },
              });
            }
          }
        } else if (team === "black" && !game.isWhiteTurn) {
          const chess = new Chess();
          try {
            chess.load(game.currentFen ?? DEFAULT_POSITION);
          } catch (e) {
            console.log(e);
          }
          console.log(chess.fen());
          let moveResult: any;
          try {
            moveResult = chess.move(move);
          } catch (err) {
            console.error("Invalid move received from black side:", move, err);
            socket.emit("invalidMove", { roomId, move });
            return;
          }
          if (typeof moveResult === "object") {
            const currentTime = Date.now();
            const timeElapsed =
              currentTime - (game.lastMoveTime ?? currentTime);
            game.blackTimeRemaining = Math.max(
              0,
              (game.blackTimeRemaining ?? 0) -
                timeElapsed +
                (game.timeIncrement ?? 0),
            );
            game.lastMoveTime = currentTime;
            console.log(game.blackTimeRemaining);
            if (game.blackTimeRemaining <= 0) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "black",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "white",
              });
              game.isOngoing = false;
              await game.save();
              return;
            }
            if (chess.isCheckmate()) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "black",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "black",
              });
              game.isOngoing = false;
              await game.save();
              return;
            } else if (chess.isStalemate()) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "draw",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "draw",
              });
              game.isOngoing = false;
              await game.save();
              return;
            } else if (chess.isDraw()) {
              const { newWhite, newBlack } = calculateElo(
                getSafeElo(game.whiteElo),
                getSafeElo(game.blackElo),
                "draw",
              );
              await User.findByIdAndUpdate(game.whitePlayer, { elo: newWhite });
              await User.findByIdAndUpdate(game.blackPlayer, { elo: newBlack });
              io.to(roomId).emit("gameOver", {
                roomId,
                winner: "draw",
              });
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
                blackTimeRemaining: game.blackTimeRemaining,
                move: {
                  from: move.from,
                  to: move.to,
                },
              });
            }
          }
        }
      },
    );

    socket.on(
      "rejoin",
      async ({ userId, roomId }: { userId: string; roomId: string }) => {
        const game = await Game.findOne({ roomId, isOngoing: true });
        if (!game) {
          return;
        }
        if (activeGames.has(roomId)) {
          clearTimeout(activeGames.get(roomId));
          activeGames.delete(roomId);
        }
        // Fix: Compare ObjectId to string using .toString()
        let team: "white" | "black";
        if (game.whitePlayer && game.whitePlayer.toString() === userId) {
          team = "white";
        } else if (game.blackPlayer && game.blackPlayer.toString() === userId) {
          team = "black";
        } else {
          // User is not a player in this game, do not proceed
          return;
        }
        if (team === "white") {
          socket.join(roomId);
          socket.emit("rejoined", {
            roomId,
            currentFen: game.currentFen,
            isWhiteTurn: game.isWhiteTurn,
            blackPlayer: game.blackPlayer,
            whitePlayer: game.whitePlayer,
            whiteTimeRemaining: game.whiteTimeRemaining,
            blackTimeRemaining: game.blackTimeRemaining,
          });
        } else if (team === "black") {
          socket.join(roomId);
          socket.emit("rejoined", {
            roomId,
            currentFen: game.currentFen,
            isWhiteTurn: game.isWhiteTurn,
            blackPlayer: game.blackPlayer,
            whitePlayer: game.whitePlayer,
            whiteTimeRemaining: game.whiteTimeRemaining,
            blackTimeRemaining: game.blackTimeRemaining,
          });
        }
      },
    );

    socket.on("disconnect", async () => {
      console.log("A user disconnected:", socket.id);
      // Remove the user from the waiting queue if they were waiting to be matched
      waitingUsers.delete(socket.id);
      const whiteGame = await Game.findOne({ whitePlayerSocketId: socket.id });
      const blackGame = await Game.findOne({ blackPlayerSocketId: socket.id });
      if (whiteGame) {
        const timeOutId = setTimeout(async () => {
          // White player failed to reconnect ⇒ Black wins
          const { newWhite, newBlack } = calculateElo(
            getSafeElo(whiteGame.whiteElo),
            getSafeElo(whiteGame.blackElo),
            "black",
          );
          await User.findByIdAndUpdate(whiteGame.whitePlayer, {
            elo: newWhite,
          });
          await User.findByIdAndUpdate(whiteGame.blackPlayer, {
            elo: newBlack,
          });
          await whiteGame.updateOne({
            $set: {
              isOngoing: false,
              winner: whiteGame.blackPlayer,
              whitePlayerSocketId: null,
              blackPlayerSocketId: null,
            },
          });
          io.to(whiteGame.roomId).emit("gameOver", {
            roomId: whiteGame.roomId,
            winner: whiteGame.blackPlayer,
            reason: "opponent_disconnected",
          });
        }, 15000); // 15 seconds
        activeGames.set(whiteGame.roomId, timeOutId);
      }
      if (blackGame) {
        const timeOutId = setTimeout(async () => {
          // Black player failed to reconnect ⇒ White wins
          const { newWhite, newBlack } = calculateElo(
            getSafeElo(blackGame.whiteElo),
            getSafeElo(blackGame.blackElo),
            "white",
          );
          await User.findByIdAndUpdate(blackGame.whitePlayer, {
            elo: newWhite,
          });
          await User.findByIdAndUpdate(blackGame.blackPlayer, {
            elo: newBlack,
          });
          await blackGame.updateOne({
            $set: {
              isOngoing: false,
              winner: blackGame.whitePlayer,
              whitePlayerSocketId: null,
              blackPlayerSocketId: null,
            },
          });
          io.to(blackGame.roomId).emit("gameOver", {
            roomId: blackGame.roomId,
            winner: blackGame.whitePlayer,
            reason: "opponent_disconnected",
          });
        }, 15000); // 15 seconds
        activeGames.set(blackGame.roomId, timeOutId);
      }
    });
  });
};
