import { StyleSheet } from 'react-native'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AILevel3Screen from '@/components/ai/AILevel3Screen'

export default function aiLevel3(){
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <AILevel3Screen />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({}) 