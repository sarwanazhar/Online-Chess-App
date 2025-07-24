import { StyleSheet } from 'react-native'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AILevel1Screen from '@/components/ai/AILevel1Screen'

export default function aiLevel1(){
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <AILevel1Screen />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({}) 