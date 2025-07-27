import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AntDesign from '@expo/vector-icons/build/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/build/Entypo';
import { router } from 'expo-router';
import { useQuickmatchStore } from '@/store/useQuickmatchStore';
import { usePlayWithAIStore } from '@/store/usePlayWithAIStore';
import { useCreateGameModalStore } from '@/store/useCreateGameModalStore';
import { useJoinGameModalStore } from '@/store/useJoinGameModalStore';

const buttonsContainer = ({ scrollToTop }: { scrollToTop: () => void }) => {
    const { setIsQuickmatch } = useQuickmatchStore();
    const { setIsPlayWithAI } = usePlayWithAIStore();
    const { setIsCreateGameModalOpen } = useCreateGameModalStore();
    const { setIsJoinGameModalOpen } = useJoinGameModalStore();
  return (
    <View style={styles.buttonsContainer}>
        {/* Quick Match */}
        <TouchableOpacity style={styles.button} onPress={() => {
            setIsQuickmatch(true);
            scrollToTop();
        }}>
            <View style={styles.buttonContent}>
            <AntDesign name="pluscircle" color="#FFF" size={hp(3.2)} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
                Quick Match
            </Text>
            </View>
        </TouchableOpacity>
        {/* Play with AI */}
        <TouchableOpacity style={styles.button2} onPress={() => {
            setIsPlayWithAI(true);
            scrollToTop();
        }}>
            <View style={styles.buttonContent2}>
            <MaterialCommunityIcons name="robot" color="#FFF" size={hp(3.2)} style={styles.buttonIcon} />
                <Text style={styles.buttonText2}>
                    Play with AI
                </Text>
            </View>
        </TouchableOpacity>
        {/* Create Game */}
        <TouchableOpacity style={styles.button2} onPress={() => {
            setIsCreateGameModalOpen(true);
            scrollToTop();
        }}>
            <View style={styles.buttonContent2}>
            <Entypo name="plus" color="#FFF" size={hp(3.2)} style={styles.buttonIcon} />
                <Text style={styles.buttonText2}>
                    Create Game
                </Text>
            </View>
        </TouchableOpacity>
        {/* Join Game */}
        <TouchableOpacity style={styles.button2} onPress={() => {
            setIsJoinGameModalOpen(true);
            scrollToTop();
        }}>
            <View style={styles.buttonContent2}>
                <Entypo name="magnifying-glass" color="#FFF" size={hp(3.2)} style={styles.buttonIcon} />
                <Text style={styles.buttonText2}>
                    Join Game
                </Text>
            </View>
        </TouchableOpacity>
    </View>
  )
}

export default buttonsContainer

const styles = StyleSheet.create({
    buttonsContainer: {
        height: hp(50),
        width: wp(100),
        padding: wp(5),
    },
    button: {
        backgroundColor: '#007BFF',
        height: hp(9),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
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
        marginRight: wp(1),
    },
    button2: {
        backgroundColor: '#2D2D2D',
        height: hp(9),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    buttonText2: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: '#FFF',
    },
    buttonContent2: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    }
})