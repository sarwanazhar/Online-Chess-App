import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { storage } from '@/libs/storage';
import { useGamesInfoStore } from '@/store/useGamesInfo';

const headerContainer = () => {
  const userId = storage.getString("id")
  const [elo, setElo] = useState<string>("");
  const [wins, setWins] = useState<string>("");
  const [games, setGames] = useState<string>("");
  const {setRating, setTotalGames, setWins: setWinsStore} = useGamesInfoStore();
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://192.168.100.9:8000/users/detail/${userId}`);
      const data = await response.json();
      setElo(data.rating);
      setWins(data.totalWins);
      setGames(data.totalGames);
      setRating(data.rating);
      setTotalGames(data.totalGames);
      setWinsStore(data.totalWins);
    }
    fetchData()
  }, [])

  return (
    <View style={styles.headerContainer}>
    <View>
    <Text style={styles.headerText}>Welcome Back!</Text>
    <Text style={styles.headerSubText}>Ready to play Chess?</Text>
    </View>

    {/* Cards */}
    <View style={styles.cardsContainer}>
      {/* Rating */}
      <View style={styles.card}>
        <Text style={styles.cardText}>{elo}</Text>
        <Text style={styles.cardSubText}>Rating</Text>
      </View>
      {/* Wins */}
      <View style={styles.card}>
        <Text style={styles.cardText}>{wins}</Text>
        <Text style={styles.cardSubText}>Wins</Text>
      </View>
      {/* Games */}
      <View style={styles.card}>
        <Text style={styles.cardText}>{games}</Text>
        <Text style={styles.cardSubText}>Games</Text>
      </View>
    </View>

  </View>
  )
}

export default headerContainer

const styles = StyleSheet.create({
    headerContainer: {
        height: hp(30),
        width: wp('100%'),
        flex: 1,
        padding: hp(2),
      },
      headerText: {
        fontSize: wp(8),
        fontWeight: 'bold',
        color: '#FFF',
      },
      headerSubText: {
        fontSize: wp(4.6),
        color: '#CCC9C1',
      },
      cardsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: wp(2),
        marginTop: hp(4),
      },
      card: {
        backgroundColor: "#2D2D2D",
        height: hp(12),
        width: wp(28),
        borderRadius: wp(2),
        padding: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
      },
      cardText: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: '#007BFF',
      },
      cardSubText: {
        fontSize: wp(4.5),
        color: '#CCC9C1',
      }
})