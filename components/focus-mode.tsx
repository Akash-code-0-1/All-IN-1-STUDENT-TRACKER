"use client"

import { useState, useEffect } from "react"

export default function FocusMode() {
  const [focusDuration, setFocusDuration] = useState<number>(25 * 60) // Default to 25 minutes
  const [breakDuration, setBreakDuration] = useState<number>(5 * 60) // Default to 5 minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(focusDuration)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isBreak, setIsBreak] = useState<boolean>(false)
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      clearInterval(interval)
      if (isBreak) {
        completeBreakSession()
      } else {
        completeFocusSession()
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeRemaining, isBreak])

  const startFocusSession = () => {
    setIsActive(true)
    setTimeRemaining(focusDuration)
    setIsBreak(false)
  }

  const completeFocusSession = () => {
    setIsActive(false)
    setSessionsCompleted((prevSessions) => prevSessions + 1)
    startBreakSession()
  }

  const startBreakSession = () => {
    setIsActive(true)
    setTimeRemaining(breakDuration)
    setIsBreak(true)
  }

  const completeBreakSession = () => {
    setIsActive(false)
  }

  const cancelFocusSession = () => {
    setIsActive(false)
    setTimeRemaining(focusDuration)
    setIsBreak(false)
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Focus Mode</h1>
      <div className="mb-4">
        <label htmlFor="focusDuration" className="mr-2">
          Focus Duration (minutes):
        </label>
        <input
          type="number"
          id="focusDuration"
          className="border rounded px-2 py-1 w-20"
          value={focusDuration / 60}
          onChange={(e) => setFocusDuration(Number.parseInt(e.target.value) * 60)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="breakDuration" className="mr-2">
          Break Duration (minutes):
        </label>
        <input
          type="number"
          id="breakDuration"
          className="border rounded px-2 py-1 w-20"
          value={breakDuration / 60}
          onChange={(e) => setBreakDuration(Number.parseInt(e.target.value) * 60)}
        />
      </div>
      <div className="text-5xl font-bold mb-4">{formatTime(timeRemaining)}</div>
      <div className="flex space-x-4">
        {!isActive ? (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={startFocusSession}
          >
            Start Focus
          </button>
        ) : (
          <>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={cancelFocusSession}
            >
              Cancel
            </button>
          </>
        )}
      </div>
      <div className="mt-4">Sessions Completed: {sessionsCompleted}</div>
    </div>
  )
}
