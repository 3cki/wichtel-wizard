'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Gift, Users, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [groupCode, setGroupCode] = useState('')
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

  const handleJoinGroup = async () => {
    if (!groupCode) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups?code=${groupCode.toUpperCase()}`)
      if (response.ok) {
        router.push(`/group/${groupCode.toUpperCase()}`)
      } else {
        alert('Gruppe nicht gefunden. Bitte überprüfe den Code und versuche es erneut.')
      }
    } catch (error) {
      console.error('Error joining group:', error)
      alert('Fehler beim Beitreten zur Gruppe. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold">
              Wichteln Wizard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Organisiere dein Wichteln ganz einfach online
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Neue Gruppe erstellen</CardTitle>
              <CardDescription>
                Starte eine neue Wichtel-Gruppe für Freunde, Familie oder Kollegen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push('/create')}
              >
                Gruppe erstellen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gruppe beitreten</CardTitle>
              <CardDescription>
                Gib deinen Gruppen-Code ein, um mitzumachen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupCode">Gruppen-Code</Label>
                <Input
                  id="groupCode"
                  placeholder="z.B. ABC123"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleJoinGroup}
                disabled={!groupCode || isLoading}
              >
                {isLoading ? 'Trete bei...' : 'Gruppe beitreten'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">So funktioniert's</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <CardTitle className="text-lg">Erstellen oder Beitreten</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Starte eine neue Gruppe oder tritt einer bestehenden mit dem Gruppen-Code bei
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <CardTitle className="text-lg">Wünsche hinzufügen</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Erstelle deine Wunschliste mit Geschenkideen für deinen Wichtel
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <CardTitle className="text-lg">Auslosen & Schenken</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Die App lost aus und zeigt dir, wen du beschenken darfst - samt Wunschliste
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
