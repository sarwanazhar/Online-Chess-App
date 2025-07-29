import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import HeaderContainer from "@/components/profile/headerContainer";
import Cards from "@/components/profile/cards";
import Buttons from "@/components/profile/buttons";
import { storage } from "@/libs/storage";
import { useGamesInfoStore } from "@/store/useGamesInfo";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const id = storage.getString("id");
  const { rating } = useGamesInfoStore();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1A1A1A",
        }}
      >
        <StatusBar backgroundColor="#2D2D2D" barStyle="light-content" />
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView>
          <View style={styles.container}>
            <HeaderContainer rating={rating} />
            <Cards />
            <Buttons />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
};

export default profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    height: hp(100),
    width: wp(100),
    padding: wp(5),
  },
});
