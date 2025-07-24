import { create } from 'zustand'

interface UserStore {
    loggedInToken: string | null
    setLoggedInToken: (token: string) => void
}

const useStore = create<UserStore>((set) => ({
    loggedInToken: null,
    setLoggedInToken: (token: string) => set({ loggedInToken: token }),
}))

export default useStore