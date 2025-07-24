import { StyleSheet } from 'react-native'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AILevel2Screen from '@/components/ai/AILevel2Screen'

export default function aiLevel2(){
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <AILevel2Screen />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({}) 