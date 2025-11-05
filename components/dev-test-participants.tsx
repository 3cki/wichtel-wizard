'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DevTestParticipantsProps {
  groupCode: string
  onParticipantsAdded?: () => void
}

export function DevTestParticipants({ groupCode, onParticipantsAdded }: DevTestParticipantsProps) {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const [count, setCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAddParticipants = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/test-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupCode,
          count,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to add test participants' })
      } else {
        setMessage({ type: 'success', text: data.message })
        onParticipantsAdded?.()
      }
    } catch (error) {
      console.error('Error adding test participants:', error)
      setMessage({ type: 'error', text: 'Failed to add test participants' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-yellow-500 bg-yellow-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔧</span>
        <h3 className="font-semibold text-yellow-900">Dev Mode: Add Test Participants</h3>
      </div>
      <p className="text-sm text-yellow-800 mb-3">
        Add test participants to this group without SMS authentication (development only)
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          max="10"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20"
          disabled={loading}
        />
        <Button
          onClick={handleAddParticipants}
          disabled={loading}
          size="sm"
          variant="secondary"
        >
          {loading ? 'Adding...' : `Add ${count} Test User${count > 1 ? 's' : ''}`}
        </Button>
      </div>
      {message && (
        <p className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
