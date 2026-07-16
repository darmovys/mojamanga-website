import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface VerificationState {
  timeRemaining: number
  isExpired: boolean
  decrement: () => void
  setTime: (time: number) => void
  setExpired: (expired: boolean) => void
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      timeRemaining: 10,
      isExpired: false,
      decrement: () =>
        set((state) => ({
          timeRemaining: Math.max(0, state.timeRemaining - 1),
        })),
      setTime: (time) => set({ timeRemaining: time }),
      setExpired: (expired) => set({ isExpired: expired }),
    }),
    {
      name: 'email-verification-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
