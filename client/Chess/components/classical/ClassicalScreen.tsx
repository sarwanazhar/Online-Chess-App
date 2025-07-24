import socket from '@/libs/socket';
import { storage } from '@/libs/storage';
import { useConfirmModalStore } from '@/store/useConfirmModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ChessboardRef } from 'expo-chessboard';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import ConfrimModal from '../modals/confirmModal';
import Timer from './Timer';
import SearchingModal from '../modals/searchingModal';
import { useRouter } from 'expo-router';

// Lazy‑loaded heavy component
const LazyChessboard = lazy(() => import('expo-chessboard'));

const MemoizedLazyChessboard = React.memo(
  React.forwardRef<ChessboardRef, React.ComponentPropsWithRef<typeof LazyChessboard>>((props, ref) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyChessboard ref={ref} {...props} />
    </Suspense>
  ))
);

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

export default function ClassicalScreen() {

  const router = useRouter();
  const { setIsConfirmModalOpen, isConfirmModalOpen } = useConfirmModalStore();
  const chessboardRef = useRef<ChessboardRef>(null);
  const username = storage.getString('username') || '';
  const userId = storage.getString('id') || '';
  const timeControl = "classical"

  const [opponentName, setOpponentName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>();
  const [isPlayerWhite, setIsPlayerWhite] = useState<boolean | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>();

  const [isSearching, setIsSearching] = useState<boolean>(true);

  // Remaining time for both players (in milliseconds)
  const [whiteTimeRemaining, setWhiteTimeRemaining] = useState<number>(0);
  const [blackTimeRemaining, setBlackTimeRemaining] = useState<number>(0);

  // Show alert on game over
  useEffect(() => {
    function handleGameOver(data: { winner: string; reason?: string }) {
      let message = '';

      if (data.winner === 'draw') {
        message = "It's a draw.";
      } else {
        const playerColor = isPlayerWhite ? 'white' : 'black';

        // winner may be color or user id
        const didPlayerWin = data.winner === playerColor || data.winner === userId;
        message = didPlayerWin ? 'You won!' : 'You lost.';
      }

      socket.disconnect();
      Alert.alert('Game Over', message);
      router.replace('/');
    }

    socket.on('gameOver', handleGameOver);
    return () => {
      socket.off('gameOver', handleGameOver);
    };
  }, [isPlayerWhite, userId]);

  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Connected');
      socket.emit('join', { userId, timeControl });
    };

    socket.on('connect', onConnect);

    socket.on('gameStart', (data: GameStartData) => {
      console.log('🔥 Game Started', data);
      if (data.whitePlayer === userId) {
        setOpponentName(data.blackPlayerName);
        setIsPlayerWhite(true);
        setOrientation('white');
      } else {
        setOpponentName(data.whitePlayerName);
        setIsPlayerWhite(false);
        setOrientation('black');
      }

      // Set turn according to server's value (true = white to move)
      setTurn(data.isWhiteTurn ? 'w' : 'b');
      // initialise clocks
      setWhiteTimeRemaining(data.whiteTimeRemaining);
      setBlackTimeRemaining(data.blackTimeRemaining);
      setRoomId(data.roomId);
      storage.delete("currentRoomId")
      storage.set("currentRoomId", data.roomId)
      setIsSearching(false);
    });
    return () => {
      socket.off('connect', onConnect);
      socket.off('gameStart');
    };
  }, [userId]);

  // Listen for clock updates that come with each move
  useEffect(() => {
    const handleMoveEvent = (data: { isWhiteTurn: boolean; whiteTimeRemaining: number; blackTimeRemaining: number; move: { from: string; to: string; } }) => {
      const move = {
        from: data.move.from,
        to: data.move.to,
      }
      chessboardRef.current?.move(move)
      setTurn(data.isWhiteTurn ? 'w' : 'b');
      setWhiteTimeRemaining(data.whiteTimeRemaining);
      setBlackTimeRemaining(data.blackTimeRemaining);
    };

    socket.on('move', handleMoveEvent);
    return () => {
      socket.off('move', handleMoveEvent);
    };
  }, []);

  // Connect to socket
  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.disconnect()
    }
  }, [])


  // Local ticking every second for the side to move
  useEffect(() => {
    if (!turn) return;

    const interval = setInterval(() => {
      setWhiteTimeRemaining(prev => (turn === 'w' ? Math.max(prev - 1000, 0) : prev));
      setBlackTimeRemaining(prev => (turn === 'b' ? Math.max(prev - 1000, 0) : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [turn]);

  const handleMove = (state: any) => {
    try {
      const { from, to, color } = state.move || state;
      if (roomId) {
        socket.emit('move', { userId, roomId, move: { from, to } });
      }
      // Save the color that just moved. Opponent will be next to move.
      setTurn(color);
    } catch (e) {
      console.log(e);
    }
  };

  const handleExitSearch = () => {
    try {
      socket.disconnect();
    } catch (e) {
      console.log(e);
    }
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {isConfirmModalOpen && <ConfrimModal />}
      {isSearching && <SearchingModal onExit={handleExitSearch} />}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="arrow-left"
          color="white"
          size={hp(3)}
          onPress={() => setIsConfirmModalOpen(true)}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>Classical</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <View style={styles.box}>
            <MaterialCommunityIcons name="account" color="white" size={hp(3)} style={styles.contentHeaderLeftIcon} />
            <Text style={styles.contentHeaderLeftText}>{username}</Text>
          </View>
          <View style={styles.box}>
            <MaterialCommunityIcons name="account" color="white" size={hp(3)} style={styles.contentHeaderLeftIcon} />
            <Text style={styles.contentHeaderLeftText}>
              {opponentName || 'Start Game'}
            </Text>
          </View>
        </View>

        {/* Chess clock */}
        <Timer
          whiteTime={whiteTimeRemaining}
          blackTime={blackTimeRemaining}
          activeTurn={turn}
          orientation={orientation}
        />

        <View style={styles.board}>
          {!isSearching && orientation && (
            <MemoizedLazyChessboard
              key={orientation}  // force remount if orientation changes
              ref={chessboardRef}
              orientation={orientation}
              gestureEnabled={true}
              player={isPlayerWhite ? 'white' : 'black'}
              onMove={handleMove}
            />
          )}
          <View style={styles.boardFooter}>
            <Text>
              test
            </Text>
          </View>
        </View>
      </View>

    </View>
  );
}

function LoadingSpinner() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1A1A1A', flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(8),
  },
  headerIcon: { position: 'absolute', left: wp(2), top: hp(3) },
  headerText: { color: 'white', fontSize: hp(2.5), fontWeight: 'bold' },
  content: { flex: 1, },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(8),
    paddingHorizontal: wp(2),
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    padding: wp(2.5),
    justifyContent: 'center',
    borderRadius: wp(5),
  },
  contentHeaderLeftIcon: {
    marginRight: wp(2),
    backgroundColor: '#2D2D2D',
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(5),
  },
  contentHeaderLeftText: {
    color: 'white',
    fontSize: hp(2.5),
    fontWeight: 'bold',
  },
  board: { justifyContent: 'center', alignItems: 'center', marginTop: hp(5), height: "auto", flex: 1 },
  boardFooter: {
    height: hp(10),
    width: wp(100),
    justifyContent: 'center',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  startGameAgain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    padding: wp(4),
    borderRadius: wp(5),
  }
});
