import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface TimerProps {
  whiteTime: number; // milliseconds remaining for white
  blackTime: number; // milliseconds remaining for black
  activeTurn?: 'w' | 'b';
  /**
   * Board orientation. If 'white', white timer should be shown at the bottom –
   * mimicking typical chess UI where the player is always at the bottom.
   */
  orientation?: 'white' | 'black';
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const Timer: React.FC<TimerProps> = ({
  whiteTime,
  blackTime,
  activeTurn,
  orientation,
}) => {
  const isWhiteActive = activeTurn === 'w';
  const containerStyle =
    orientation === 'white' ? styles.container : styles.containerReverse;

  return (
    <View style={containerStyle}>
      {/* White timer (top when player orientation is black) */}
      <View
        style={[styles.clockBox, isWhiteActive ? styles.activeClock : null]}
      >
        <Text style={styles.clockText}>{formatTime(whiteTime)}</Text>
      </View>

      {/* Black timer */}
      <View
        style={[styles.clockBox, !isWhiteActive ? styles.activeClock : null]}
      >
        <Text style={styles.clockText}>{formatTime(blackTime)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    alignItems: 'center',
    marginTop: hp(1),
  },
  containerReverse: {
    width: wp(100),
    alignItems: 'center',
    flexDirection: 'column-reverse',
    marginTop: hp(1),
  },
  clockBox: {
    width: wp(90),
    backgroundColor: '#2D2D2D',
    marginVertical: hp(0.5),
    paddingVertical: hp(1),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeClock: {
    backgroundColor: '#404040',
  },
  clockText: {
    color: '#FFFFFF',
    fontSize: hp(3),
    fontWeight: 'bold',
  },
});

export default Timer; 