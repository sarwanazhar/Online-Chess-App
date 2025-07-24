import React, { lazy, Suspense, useRef, useState } from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { Game } from 'js-chess-engine';
import type { ChessboardRef } from 'expo-chessboard';
import { useRouter } from 'expo-router';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const LazyChessboard = lazy(() => import('expo-chessboard'));
const MemoizedChessboard = React.memo(
  React.forwardRef<ChessboardRef, React.ComponentPropsWithRef<typeof LazyChessboard>>((props, ref) => (
    <Suspense fallback={<View style={styles.loader}><Text style={{ color: '#fff' }}>Loading...</Text></View>}>
      <LazyChessboard ref={ref} {...props} />
    </Suspense>
  ))
);

export default function AILevel1Screen() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const router = useRouter();

  const [game] = useState(() => new Game());
  const [fen, setFen] = useState(game.exportFEN());

  const handleMove = (state: any) => {
    const { from, to } = state.move || state;

    if (!game.move(from.toUpperCase(), to.toUpperCase())) return false;

    const aiObj = game.aiMove(0); // Level 0 difficulty
    const aiFrom = Object.keys(aiObj)[0];
    const aiTo = aiObj[aiFrom];

    chessboardRef.current?.move({ from: aiFrom.toLowerCase(), to: aiTo.toLowerCase() });
    setFen(game.exportFEN());

    return true;
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
        <Text style={styles.headerText}>Play vs AI - Level 1</Text>
      </View>

      <View style={styles.boardWrapper}>
        <MemoizedChessboard
          ref={chessboardRef}
          fen={fen}
          gestureEnabled
          player="white"
          onMove={handleMove}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141E30' },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: hp(8) },
  headerIcon: { position: 'absolute', left: hp(2) },
  headerText: { color: 'white', fontSize: hp(2.8), fontWeight: 'bold' },
  boardWrapper: { flex: 1, marginTop: hp(25) },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
}); 