import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ClassicalScreen from '@/components/classical/ClassicalScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const classical = () => {
  return (
    <GestureHandlerRootView>
      <ClassicalScreen />
    </GestureHandlerRootView>
  )
}

export default classical

const styles = StyleSheet.create({})