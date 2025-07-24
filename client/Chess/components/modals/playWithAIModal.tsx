import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { usePlayWithAIStore } from '@/store/usePlayWithAIStore'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { router } from 'expo-router'

const PlayWithAIModal = () => {
  const { setIsPlayWithAI } = usePlayWithAIStore();

  const handleNavigate = (level: 1 | 2 | 3) => {
    setIsPlayWithAI(false);
    router.push(`/aiLevel${level}` as any);
  }

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setIsPlayWithAI(false)}>
          <MaterialCommunityIcons name="close" color="white" size={hp(3)} />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          {[1, 2, 3].map(level => (
            <TouchableOpacity key={level} style={styles.button} onPress={() => handleNavigate(level as 1|2|3)}>
              <Text style={styles.buttonText}>{`Level ${level}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

export default PlayWithAIModal

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(85),
    width: wp(100),
  },
  modalContainer: {
    backgroundColor: '#2D2D2D',
    height: hp(30),
    width: wp(70),
    borderRadius: hp(2),
    padding: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: hp(1),
    right: wp(2),
    width: hp(5),
    height: hp(4),
    backgroundColor: '#3D3D3D',
    borderRadius: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(2),
  },
  buttonText: {
    color: 'white',
    fontSize: hp(2.5),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3D3D3D',
    borderRadius: hp(1.5),
    padding: hp(1),
    width: wp(40),
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
}) 