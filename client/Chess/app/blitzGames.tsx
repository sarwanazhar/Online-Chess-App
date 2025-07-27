import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BlitzScreen from "@/components/blitz/BlitzScreen";

const blitzGames = () => {
  return (
    <GestureHandlerRootView>
      <BlitzScreen />
    </GestureHandlerRootView>
  );
};

export default blitzGames;
