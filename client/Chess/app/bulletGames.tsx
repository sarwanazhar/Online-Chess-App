import { StyleSheet } from 'react-native'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BulletScreen from '@/components/bullet/BulletScreen'

const bulletGames = () => {
  return (
    <GestureHandlerRootView>
      <BulletScreen />
    </GestureHandlerRootView>
  )
}

export default bulletGames

const styles = StyleSheet.create({}) 