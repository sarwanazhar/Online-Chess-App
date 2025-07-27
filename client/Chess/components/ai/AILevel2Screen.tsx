import React, { lazy, Suspense, useRef, useState } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import type { ChessboardRef } from "expo-chessboard";
import { useRouter } from "expo-router";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Square } from "chess.js";
import { getBestAIMoveFromFen } from "@/libs/chessAi";

const LazyChessboard = lazy(() => import("expo-chessboard"));
const MemoizedChessboard = React.memo(
  React.forwardRef<
    ChessboardRef,
    React.ComponentPropsWithRef<typeof LazyChessboard>
  >((props, ref) => (
    <Suspense
      fallback={
        <View style={styles.loader}>
          <Text style={{ color: "#fff" }}>Loading...</Text>
        </View>
      }
    >
      <LazyChessboard ref={ref} {...props} />
    </Suspense>
  )),
);

export default function AILevel3Screen() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const router = useRouter();
  const turnRef = useRef<"black" | "white">("white");
  const awaitingAI = useRef(false);

  const handleMove = async (state: any) => {
    console.log("Move event", { turn: turnRef.current });

    if (awaitingAI.current) {
      console.log("AI move in progress, ignoring");
      return;
    }

    // After player's move (white), trigger AI's move (black)
    if (turnRef.current === "white") {
      console.log("User (white) played, now AI's turn");
      turnRef.current = "black";

      console.log("AI thinking...");
      awaitingAI.current = true;

      // Use level 3 for AILevel3Screen
      const move = getBestAIMoveFromFen(state.state.fen, 2);
      console.log("AI move:", move);

      if (move?.from && move?.to) {
        await chessboardRef.current?.move({
          from: move.from as Square,
          to: move.to as Square,
        });
      }

      turnRef.current = "white";
      awaitingAI.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="arrow-left"
          color="white"
          size={hp(3)}
          onPress={() => router.back()}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>Play vs AI - Level 2</Text>
      </View>

      <View style={styles.boardWrapper}>
        <MemoizedChessboard
          ref={chessboardRef}
          gestureEnabled
          player="white"
          onMove={handleMove}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141E30" },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: hp(8),
  },
  headerIcon: { position: "absolute", left: hp(2) },
  headerText: { color: "white", fontSize: hp(2.8), fontWeight: "bold" },
  boardWrapper: { flex: 1, marginTop: hp(25) },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
