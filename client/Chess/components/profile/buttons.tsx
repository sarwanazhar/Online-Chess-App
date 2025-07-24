import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { storage } from '@/libs/storage'
import { router } from 'expo-router'

const Buttons = () => {
    const handleSignOut = () => {
        storage.clearAll()
        router.push("/signup")
        console.log("Sign Out")
    }

    const handleEmailPress = async () => {
        const url = 'mailto:sarwanazhar1234@gmail.com';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            Linking.openURL(url);
        } else {
            Alert.alert('No Email App', 'No email app found on this device.');
        }
    };

    return (
        <View style={styles.buttonsContainer}>
                {/* Setting Button */}
                <TouchableOpacity style={styles.button}>
                    <View style={styles.buttonContent}>
                        <MaterialCommunityIcons name="cog" color="#007BFF" size={hp(3.2)} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>
                            Settings
                        </Text>
                    </View>
                </TouchableOpacity>
                {/* Contact Us */}
                <TouchableOpacity style={styles.button} onPress={handleEmailPress}>
                    <View style={styles.buttonContent}>
                        <MaterialCommunityIcons name="email" color="#007BFF" size={hp(3.2)} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>
                            Contact Us
                        </Text>
                    </View>
                </TouchableOpacity>
                {/* Sign Out */}
                <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                    <View style={styles.buttonContent}>
                        <MaterialCommunityIcons name="logout" color="#007BFF" size={hp(3.2)} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>
                            Sign Out
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
}

export default Buttons

const styles = StyleSheet.create({
    buttonsContainer: {
        height: hp(50),
        marginBottom: hp(10),
    },
    button: {
        backgroundColor: '#2D2D2D',
        height: hp(9),
        borderRadius: wp(2),
        justifyContent: 'center',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    buttonText: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#FFF',
    },
    buttonIcon: {
        marginRight: wp(2),
    },
})