import { create } from 'zustand'

type UIState = {
  loading: boolean
  setLoading: (state: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}))
