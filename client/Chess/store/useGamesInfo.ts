import {create} from "zustand"

interface Game {
    id: string;
    white: string;
    black: string;
    result: string;
    timeControl: string;
}

interface GameInfo {
    totalGames: string;
    wins: string;
    rating: string;
    games: Game[];
    setRating: (rating: string) => void;
    setWins: (wins: string) => void;
    setTotalGames: (totalGames: string) => void;
    setGames: (games: Game[]) => void;
}

export const useGamesInfoStore = create<GameInfo>((set) => ({
    totalGames: "loading",
    wins: "loading",
    rating: "loading",
    games: [],
    setRating: (rating) => set({ rating }),
    setWins: (wins) => set({ wins }),
    setTotalGames: (totalGames) => set({ totalGames }),
    setGames: (games) => set({ games }),
}))
