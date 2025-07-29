import { StatusBar, StyleSheet, View } from "react-native";
import React from "react";
import RecentGames from "@/components/home/recentGames";
import { useGamesInfoStore } from "@/store/useGamesInfo";

const games = () => {
  const { games } = useGamesInfoStore();
  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#2D2D2D" barStyle="light-content" />
      <RecentGames games={games || []} scrollEnabled={true} />
    </View>
  );
};

export default games;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
});
