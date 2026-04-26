import { useState } from 'react'

/**
 * Custom hook to sync state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('useLocalStorage error:', error)
    }
  }

  return [storedValue, setValue]
}
