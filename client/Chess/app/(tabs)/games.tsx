import { StyleSheet, View } from 'react-native'
import React from 'react'
import RecentGames from '@/components/home/recentGames'
import { useGamesInfoStore } from '@/store/useGamesInfo'

const games = () => {
  const {games} = useGamesInfoStore()
  return (
    <View style={styles.mainContainer}>
      <RecentGames games={games || []} scrollEnabled={true} />
    </View> 
  )
}

export default games

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
})