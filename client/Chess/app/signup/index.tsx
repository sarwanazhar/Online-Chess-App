import FormForSignUp from "@/components/formForSignUp";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#2D2D2D" barStyle="light-content" />
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
                Create a new account to continue
              </Text>
            </View>
          </View>
        </View>
        <FormForSignUp />
      </View>
    </SafeAreaView>
  );
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

export default SignUp;
