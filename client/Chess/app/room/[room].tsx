import socket from "@/libs/socket";
import { storage } from "@/libs/storage";
import { useConfirmModalStore } from "@/store/useConfirmModal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ChessboardRef } from "expo-chessboard";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import ConfrimModal from "@/components/modals/confirmModal";
import Timer from "@/components/classical/Timer";
import WaitingModal from "@/components/modals/waitingModal";
import { useLocalSearchParams, useRouter } from "expo-router";

// Lazy-loaded heavy component
const LazyChessboard = lazy(() => import("expo-chessboard"));

const MemoizedLazyChessboard = React.memo(
  React.forwardRef<
    ChessboardRef,
    React.ComponentPropsWithRef<typeof LazyChessboard>
  >((props, ref) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyChessboard ref={ref} {...props} />
    </Suspense>
  )),
);

interface RejoinedData {
  roomId: string;
  currentFen: string;
  isWhiteTurn: boolean;
  whitePlayer: string;
  blackPlayer: string;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
}

interface GameStartData {
  roomId: string;
  whitePlayer: string;
  whitePlayerName: string;
  blackPlayer: string;
  blackPlayerName: string;
  currentFen: string;
  isWhiteTurn: boolean;
  timeControl: string;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
}

const RoomScreen: React.FC = () => {
  const { room: roomIdParam, timeControl } = useLocalSearchParams<{
    room: string;
    timeControl: string;
  }>();
  const router = useRouter();
  const { isConfirmModalOpen } = useConfirmModalStore();
  const chessboardRef = useRef<ChessboardRef>(null);
  const userId = storage.getString("id") || "";

  // No need to track opponent name for this screen
  const [roomId, setRoomId] = useState<string | null>(roomIdParam || null);
  const [turn, setTurn] = useState<"w" | "b">();
  const [isPlayerWhite, setIsPlayerWhite] = useState<boolean | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">();

  const [isWaiting, setIsWaiting] = useState<boolean>(true);

  // Remaining time for both players (in milliseconds)
  const [whiteTimeRemaining, setWhiteTimeRemaining] = useState<number>(0);
  const [blackTimeRemaining, setBlackTimeRemaining] = useState<number>(0);

  const url = `chess://room/${roomId}?timeControl=${timeControl}`;

  // Game-over alert
  useEffect(() => {
    function handleGameOver(data: { winner: string; reason?: string }) {
      let message = "";

      if (data.winner === "draw") {
        message = "It's a draw.";
      } else {
        const playerColor = isPlayerWhite ? "white" : "black";
        const didPlayerWin =
          data.winner === playerColor || data.winner === userId;
        message = didPlayerWin ? "You won!" : "You lost.";
      }

      storage.delete("currentRoomId");
      socket.disconnect();
      Alert.alert("Game Over", message);
      router.replace("/");
    }

    socket.on("gameOver", handleGameOver);
    return () => {
      socket.off("gameOver", handleGameOver);
    };
  }, [isPlayerWhite, userId]);

  // Connection & join logic (handles reconnection too)
  useEffect(() => {
    const onConnect = () => {
      console.log("✅ Connected");
      // Always attempt joinRoom (safe for re-joins)
      if (roomId) {
        socket.emit("joinRoom", { roomId, userId });
      }
    };

    socket.on("connect", onConnect);

    // Game started event
    socket.on("gameStart", (data: GameStartData) => {
      console.log("🔥 Game Started", data);
      if (data.whitePlayer === userId) {
        setIsPlayerWhite(true);
        setOrientation("white");
      } else {
        setIsPlayerWhite(false);
        setOrientation("black");
      }

      setTurn(data.isWhiteTurn ? "w" : "b");
      setWhiteTimeRemaining(data.whiteTimeRemaining);
      setBlackTimeRemaining(data.blackTimeRemaining);
      setRoomId(data.roomId);
      storage.set("currentRoomId", data.roomId);
      setIsWaiting(false);
    });

    // Rejoined event (after reconnection)
    socket.on("rejoined", (data: RejoinedData) => {
      console.log("🔄 Rejoined game", data);
      setTurn(data.isWhiteTurn ? "w" : "b");
      setWhiteTimeRemaining(data.whiteTimeRemaining);
      setBlackTimeRemaining(data.blackTimeRemaining);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("gameStart");
      socket.off("rejoined");
    };
  }, [roomId, userId]);

  // Connect socket (and auto-reconnect)
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Local ticking for clocks
  useEffect(() => {
    if (!turn) return;
    const interval = setInterval(() => {
      setWhiteTimeRemaining((prev) =>
        turn === "w" ? Math.max(prev - 1000, 0) : prev,
      );
      setBlackTimeRemaining((prev) =>
        turn === "b" ? Math.max(prev - 1000, 0) : prev,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [turn]);

  // Listen for moves from the opponent and update board & clocks
  useEffect(() => {
    const handleMoveEvent = (data: {
      isWhiteTurn: boolean;
      whiteTimeRemaining: number;
      blackTimeRemaining: number;
      move: { from: string; to: string };
    }) => {
      const move = {
        from: data.move.from,
        to: data.move.to,
      };
      chessboardRef.current?.move(move);
      setTurn(data.isWhiteTurn ? "w" : "b");
      setWhiteTimeRemaining(data.whiteTimeRemaining);
      setBlackTimeRemaining(data.blackTimeRemaining);
    };

    socket.on("move", handleMoveEvent);
    return () => {
      socket.off("move", handleMoveEvent);
    };
  }, []);

  const handleMove = (state: any) => {
    try {
      const { from, to, color } = state.move || state;
      if (roomId) {
        socket.emit("move", { userId, roomId, move: { from, to } });
      }
      setTurn(color);
    } catch (e) {
      console.log(e);
    }
  };

  const handleExit = () => {
    try {
      // If still waiting (game not started) cancel the room on server
      if (isWaiting && roomId) {
        socket.emit("cancelRoom", { roomId, userId });
      }
      storage.delete("currentRoomId");
      socket.disconnect();
    } catch (e) {
      console.log(e);
    }
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {isConfirmModalOpen && <ConfrimModal />}
      {isWaiting && <WaitingModal url={url} onExit={handleExit} />}
      {/* Header with back button & clocks */}
      {!isWaiting && (
        <>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="arrow-left"
              color="#FFF"
              size={hp(4)}
              onPress={handleExit}
            />
            <Timer
              whiteTime={whiteTimeRemaining}
              blackTime={blackTimeRemaining}
              activeTurn={turn}
              orientation={orientation}
            />
          </View>
          {/* Chessboard */}
          {orientation && (
            <MemoizedLazyChessboard
              key={orientation}
              ref={chessboardRef}
              orientation={orientation}
              gestureEnabled={true}
              player={isPlayerWhite ? "white" : "black"}
              onMove={handleMove}
            />
          )}
          {/* Removed footer clock and name display */}
        </>
      )}
    </View>
  );
};

export default RoomScreen;

// Loading spinner for lazy chessboard
function LoadingSpinner() {
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="large" color="#FFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: wp(5),
    marginTop: hp(4),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.5),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: wp(5),
    marginBottom: hp(4),
  },
  footerTitle: {
    color: "#FFF",
    fontSize: hp(2.5),
  },
});
