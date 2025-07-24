import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import HeaderContainer from '@/components/home/headerContainer';
import ButtonsContainer from '@/components/home/buttonsContainer';
import RecentGames from '@/components/home/recentGames';
import { useQuickmatchStore } from '@/store/useQuickmatchStore';
import Quickmatch from '@/components/modals/quickmatch';
import { useGamesInfoStore } from '@/store/useGamesInfo';
import { storage } from '@/libs/storage';
import PlayWithAIModal from '@/components/modals/playWithAIModal';
import { usePlayWithAIStore } from '@/store/usePlayWithAIStore';

interface Game {
  id: string;
  white: string;
  black: string;
  result: string;
  timeControl: string;
}

const Home = () => {
  const { isQuickmatch } = useQuickmatchStore();
  const { isPlayWithAI } = usePlayWithAIStore();
  const scrollRef = useRef<ScrollView>(null);
  const userId = storage.getString("id");
  const [games, setGames] = useState<Game[] | null>(null)
  const {setGames: setGamesInfo} = useGamesInfoStore()

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`http://192.168.100.9:8000/games/get-games-by-user/${userId}`)
        const data: Game[] = await response.json()
        // Reverse the order so the most recent games show first
        setGames([...data].reverse())
        setGamesInfo([...data].reverse())
      } catch (error) {
        console.log(error)
        setGames([])
      }
    }
    fetchGames();
  }, []);

  console.log(isQuickmatch);
  return (
    <>
      <ScrollView style={styles.mainContainer} scrollEnabled={!isQuickmatch && !isPlayWithAI} ref={scrollRef}>
        <StatusBar backgroundColor="#1A1A1A" barStyle="light-content" />
        {isQuickmatch && <Quickmatch />}
        {isPlayWithAI && <PlayWithAIModal />}
        <HeaderContainer />
        <ButtonsContainer scrollToTop={scrollToTop} />
        <RecentGames games={games || []} scrollEnabled={false} />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#1A1A1A',
    height: hp('200%'),
  },
})

export default Home