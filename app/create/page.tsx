'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function CreateGroup() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [drawDate, setDrawDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lädt...</p>
      </div>
    )
  }

  const handleCreate = async () => {
    if (!name) {
      alert('Bitte gib einen Gruppennamen ein')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, drawDate }),
      })

      if (response.ok) {
        const group = await response.json()
        router.push(`/group/${group.code}`)
      } else {
        alert('Fehler beim Erstellen der Gruppe. Bitte versuche es erneut.')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Fehler beim Erstellen der Gruppe. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Wichtel-Gruppe erstellen</CardTitle>
              <CardDescription>
                Richte eine neue Wichtel-Gruppe für deine Freunde und Familie ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Gruppenname *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Familie Schmidt Weihnachten 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Füge Details zu deiner Wichtel-Gruppe hinzu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawDate">Auslosung am (Optional)</Label>
                <Input
                  id="drawDate"
                  type="date"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Lege ein Datum fest, wann das Wichteln ausgelost werden soll
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCreate}
                disabled={isLoading || !name}
              >
                {isLoading ? 'Wird erstellt...' : 'Gruppe erstellen'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
