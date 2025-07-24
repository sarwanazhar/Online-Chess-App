import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Entypo } from '@expo/vector-icons';

interface Props {
  onExit: () => void;
}

const SearchingModal: React.FC<Props> = ({ onExit }) => {
  return (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Entypo name="cross" color="#FFF" size={hp(5)} onPress={onExit} />
        </View>
        {/* Body */}
        <View style={styles.modalBody}>
          <ActivityIndicator size="large" color="#FFF" style={{ marginBottom: hp(2) }} />
          <Text style={styles.modalText}>Searching for a game...</Text>
          <TouchableOpacity style={styles.modalBodyButton} onPress={onExit}>
            <Text style={styles.modalBodyButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: hp(0.5),
    height: hp(5),
  },
  modalBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  modalText: {
    color: '#FFF',
    fontSize: hp(2.5),
    marginBottom: hp(2),
  },
  modalBodyButton: {
    backgroundColor: '#007BFF',
    height: hp(8),
    width: wp(60),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  modalBodyButtonText: {
    color: 'white',
    fontSize: hp(2.5),
    fontWeight: 'bold',
  },
});

export default SearchingModal; 