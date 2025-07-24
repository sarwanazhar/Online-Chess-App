import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Entypo } from '@expo/vector-icons';
import { useConfirmModalStore } from '@/store/useConfirmModal';
import { router } from 'expo-router';

const ConfrimModal = () => {
    const { setIsConfirmModalOpen } = useConfirmModalStore();
    return (
        <View style={styles.modal}>
            <View style={styles.modalContent}>
                {/* header */}
                <View style={styles.modalHeader}>
                <Entypo name="cross" color="#FFF" size={hp(5)} onPress={() => setIsConfirmModalOpen(false)} />
                </View>

                <View style={styles.modalBody}>
                    <TouchableOpacity style={styles.modalBodyButton} onPress={() => {
                        router.replace("/(tabs)")
                        setIsConfirmModalOpen(false)
                    }}>
                        <Text style={styles.modalBodyButtonText}>
                            Exit Game
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default ConfrimModal

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#2D2D2D',
        width: wp(90),
        height: hp(40),
        borderRadius: wp(5),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: hp(0.5),
        height: hp(5),
    },  
    modalHeaderIcon: {
        backgroundColor: 'red',
    },
    modalBody: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    modalBodyButton: {
        backgroundColor: '#007BFF',
        height: hp(10),
        width: wp(60),
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(4),
    },
    modalBodyButtonText: {
        color: 'white',
        fontSize: hp(2.5),
        fontWeight: 'bold',
        textAlign: 'center',
    }
})