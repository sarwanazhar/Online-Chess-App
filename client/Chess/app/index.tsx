import { FontAwesome6 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import FormForLogin from "../components/formForLogin";
import { storage } from "@/libs/storage";
import { router } from "expo-router";

const Login = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = storage.getString("loggedInToken");
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#2D2D2D" barStyle="light-content" />
        <View style={styles.container}>
          <View style={styles.top}>
            <View style={styles.container1}>
              <View style={styles.container2}>
                <FontAwesome6
                  name="chess-king"
                  size={hp(6)}
                  color="white"
                  style={{ marginBottom: hp(5) }}
                />
                <Text style={styles.heading}>Play Chess Online</Text>
                <Text style={styles.subHeading}>
                  Sign in to your account to continue
                </Text>
              </View>
            </View>
          </View>
          <FormForLogin />
        </View>
      </SafeAreaView>
    );
  } else {
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  }
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2D2D2D",
    flex: 1,
  },
  top: {
    width: wp(100),
    height: hp(29),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  container1: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  container2: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  heading: {
    fontSize: hp(4),
    color: "white",
    fontWeight: "900",
  },
  subHeading: {
    fontSize: hp(2),
    color: "#CCCCCC",
    fontWeight: "400",
    textAlign: "center",
    marginTop: hp(0.3),
  },
});

export default Login;
