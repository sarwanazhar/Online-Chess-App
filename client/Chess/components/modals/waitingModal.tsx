import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Entypo } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

interface Props {
  url: string;
  onExit: () => void;
}

const WaitingModal: React.FC<Props> = ({ url, onExit }) => {
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(url);
    } catch (e) {
      console.log('Clipboard error', e);
    }
  };

  return (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Entypo name="cross" color="#FFF" size={hp(5)} onPress={onExit} />
        </View>
        {/* Body */}
        <View style={styles.modalBody}>
          <ActivityIndicator size="large" color="#FFF" style={{ marginBottom: hp(1.5) }} />
          <Text style={styles.modalText}>Waiting for opponent…</Text>

          {/* QR-code box */}
          <View style={styles.qrContainer}>
            <QRCode value={url} size={180} backgroundColor="transparent" />
          </View>
          <Text style={[styles.modalText, { fontSize: hp(2) }]}>Scan this QR on another device</Text>

          <Text style={[styles.modalText, { fontSize: hp(1.8), marginTop: hp(1) }]}>or share the link below:</Text>
          <Text selectable style={[styles.modalText, styles.urlText]}>{url}</Text>

          <TouchableOpacity style={styles.modalBodyButton} onPress={handleCopy}>
            <Text style={styles.modalBodyButtonText}>Copy URL</Text>
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
    borderRadius: wp(5),
    paddingVertical: hp(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: hp(0.5),
    height: hp(5),
  },
  modalBody: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
    gap: hp(1.5),
  },
  modalText: {
    color: '#FFF',
    fontSize: hp(2.5),
    textAlign: 'center',
  },
  urlText: {
    fontSize: hp(1.8),
    marginBottom: hp(2),
  },
  modalBodyButton: {
    backgroundColor: '#007BFF',
    height: hp(7),
    width: wp(50),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  modalBodyButtonText: {
    color: 'white',
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  qrContainer: {
    backgroundColor: '#FFF',
    padding: hp(1),
    borderRadius: wp(3),
    marginVertical: hp(1),
  },
});

export default WaitingModal; 