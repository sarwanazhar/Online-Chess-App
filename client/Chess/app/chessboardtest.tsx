import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Chessboard from 'expo-chessboard'

const chessboardtest = () => {
  return (
    <SafeAreaView>
      <Chessboard
        gestureEnabled={true}
        onMove={(state) => {
          console.log("move", state)
        }}
        fen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      />
    </SafeAreaView>
  )
}

export default chessboardtest

const styles = StyleSheet.create({})