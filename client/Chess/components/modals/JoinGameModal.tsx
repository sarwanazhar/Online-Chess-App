import React, { useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useJoinGameModalStore } from "@/store/useJoinGameModalStore";
import { router } from "expo-router";
import { storage } from "@/libs/storage";

const JoinGameModal = () => {
  const userId = storage.getString("id");
  const { setIsJoinGameModalOpen } = useJoinGameModalStore();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleJoinGame = async () => {
    try {
      const response = await fetch(
        "http://192.168.100.9:8000/games/join-game-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, gameUrl: url }),
        },
      );
      if (response.status === 200) {
        setIsJoinGameModalOpen(false);
        Linking.openURL(url);
      } else if (response.status === 404) {
        setError("Game not found");
      } else {
        setError("Invalid URL");
      }
    } catch (error) {
      console.log(error);
      setError("Invalid URL");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsJoinGameModalOpen(false)}
        >
          <MaterialCommunityIcons name="close" color="white" size={hp(3)} />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              router.replace("/scanner");
            }}
          >
            <View style={styles.scanContent}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                color="#FFF"
                size={hp(2.7)}
              />
              <Text style={styles.buttonText}>Scan QR Code</Text>
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Paste game URL"
            placeholderTextColor="#979797"
            value={url}
            onChangeText={setUrl}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.joinButton} onPress={handleJoinGame}>
            <Text style={styles.buttonText}>Join Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default JoinGameModal;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    height: hp(85),
    width: wp(100),
  },
  modalContainer: {
    backgroundColor: "#2D2D2D",
    height: hp(40),
    width: wp(80),
    borderRadius: hp(2),
    padding: hp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: hp(1),
    right: wp(2),
    width: hp(5),
    height: hp(4),
    backgroundColor: "#3D3D3D",
    borderRadius: hp(1.5),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    gap: wp(3),
  },
  buttonText: {
    color: "white",
    fontSize: hp(2.2),
    fontWeight: "bold",
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#3D3D3D",
    borderRadius: hp(1.5),
    paddingVertical: hp(1),
    width: wp(55),
    justifyContent: "center",
    alignItems: "center",
  },
  scanContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  input: {
    width: wp(65),
    height: hp(5),
    backgroundColor: "#3D3D3D",
    borderRadius: hp(1.5),
    paddingHorizontal: wp(3),
    color: "white",
  },
  joinButton: {
    backgroundColor: "#3D3D3D",
    borderRadius: hp(1.5),
    paddingVertical: hp(1),
    width: wp(45),
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: hp(1.7),
    fontWeight: "bold",
    textAlign: "center",
  },
});
