import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface Game {
  id: string;
  white: string;
  black: string;
  result: string;
  timeControl: string;
}

const RecentGames = ({scrollEnabled, games}: {scrollEnabled: boolean, games: Game[]}) => {



  // If games is null (loading) or empty array, show "No game record"
  const isEmpty = !games || games.length === 0;

  const renderItem = ({ item }: { item: Game }) => (
    <View style={styles.gameContainer}>
      <View>
        <Text style={styles.white}>{item.white}</Text>
        <Text style={styles.black}>{item.black}</Text>
      </View>
      <View>
        <Text style={styles.white}>{item.result != null ? "Winner: " + item.result : "Draw"}</Text>
        <Text style={styles.black}>{item.timeControl}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Games</Text>
      <View style={styles.gamesContainer}>
        {isEmpty ? (
          <Text style={{ color: '#FFF', fontSize: wp(4), textAlign: 'center', marginTop: hp(2) }}>
            No game record
          </Text>
        ) : (
          <FlatList
            data={games}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: hp(2), flexGrow: 1 }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled} // Disable FlatList's own scroll to prevent nested VirtualizedList issues
          />
        )}
      </View>
    </View>
  )
}

export default RecentGames

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: hp(45),
        width: wp(100),
        padding: wp(5),
    },
    title: {
        fontSize: wp(7),
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: hp(1.5),
    },
    gameContainer: {
        backgroundColor: "#2D2D2D",
        height: hp(10),
        width: wp(90),
        borderRadius: wp(2),
        marginBottom: hp(2),
        padding: wp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gamesContainer: {
        height: hp(35),
        flex: 1,
    },
    white: {
        color: '#FFF',
        fontSize: wp(4),
        textAlign: "center"
    },
    black: {
        color: '#FFF',
        fontSize: wp(4),
        textAlign: "center"
    },
})