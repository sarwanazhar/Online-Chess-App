import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { FontAwesome } from '@expo/vector-icons'
import { storage } from '@/libs/storage'

const HeaderContainer = ({rating}: {rating: string}) => {
    const username = storage.getString("username")
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="user" color="#FFF" size={hp(7)} />
      </View>
      <Text style={styles.name}>
        {username}
      </Text>
      <Text style={styles.rating}>
        Rating: {rating}
      </Text>
    </View>
  )
}

export default HeaderContainer

const styles = StyleSheet.create({
    container: {
        height: hp(28),
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        height: hp(12),
        width: hp(12),
        backgroundColor: "#2D2D2D",
        borderRadius: hp(10),
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        fontSize: hp(3.7),
        fontWeight: "bold",
        color: "#FFF",
        marginTop: hp(1),
    },
    rating: {
        fontSize: hp(2.2),
        color: "#007BFF",
        marginTop: hp(1),
        fontWeight: "bold",
    }
})