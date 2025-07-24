import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { useGamesInfoStore } from '@/store/useGamesInfo'

const Cards = () => {
  const {totalGames, wins} = useGamesInfoStore()
  return (
    <View style={styles.container}>
      {/* first card */}
      <View style={styles.card}>
        <View>
            <Text style={styles.primaryText}>
                {totalGames}
            </Text>
            <Text style={styles.secondaryText}>
                Games
            </Text>
        </View>
      </View>
      {/* second card */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
            <Text style={styles.primaryText}>
                {wins}
            </Text>
            <Text style={styles.secondaryText}>
                Wins
            </Text>
        </View>
      </View>
    </View>
  )
}

export default Cards

const styles = StyleSheet.create({
    container: {
        height: hp(18),
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: wp(2),
    },
    card: {
        backgroundColor: "#2D2D2D",
        height: hp(14),
        width: wp(40),
        borderRadius: hp(2),
        padding: wp(5),
        alignItems: "center",
        justifyContent: "center",
    },
    cardText: {
        fontSize: hp(2.5),
        fontWeight: "bold",
        color: "#FFF",
    },
    primaryText: {
        fontSize: hp(3.5),
        color: "#007BFF",
        fontWeight: "bold", 
        textAlign: "center",
    },
    secondaryText: {
        fontSize: hp(2),
        color: "#A3B8AD",
        fontWeight: "bold",
        textAlign: "center",
    },
    cardContent: {
        alignItems: "center",
        justifyContent: "center",
    }
})