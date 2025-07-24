import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"

const Header = (props: any) => {
    console.log(props.options.title)
  return (
    <SafeAreaView edges={['top']}>
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="chess-king" color="#FFF" size={24} />
                <Text style={styles.headerText}>
                    Chess Master
                </Text>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity>
                    <Feather name="user" color="#FFF" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  )
}

export default Header

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#1A1A1A',
        padding: hp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    headerText: {
        color: 'white',
        fontSize: hp(2.8),
        fontWeight: 'bold',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hp(1),
    },
    headerRight: {
        backgroundColor: '#1A1A1A',
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
    }
})