'use client'

import { use, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Gift, Sparkles, ExternalLink, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { DevTestParticipants } from '@/components/dev-test-participants'

interface Wish {
  id: string
  title: string
  description: string | null
  url: string | null
  priority: number
}

interface Participant {
  id: string
  anonymousName: string
  userId: string
  wishes: Wish[]
}

interface Group {
  id: string
  name: string
  code: string
  description: string | null
  drawn: boolean
  creatorId: string
  participants: Participant[]
}

interface Assignment {
  receiver: Participant
}

export default function GroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [group, setGroup] = useState<Group | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loadingAssignment, setLoadingAssignment] = useState(false)

  // Wish form state
  const [wishTitle, setWishTitle] = useState('')
  const [wishDescription, setWishDescription] = useState('')
  const [wishUrl, setWishUrl] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadGroup()
    }
  }, [code, status, router])

  const loadGroup = async () => {
    try {
      const response = await fetch(`/api/groups?code=${code}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data)

        // Check if user is already a participant
        if (session?.user?.id) {
          const myParticipant = data.participants.find(
            (p: Participant) => p.userId === session.user?.id
          )
          if (myParticipant) {
            setParticipantId(myParticipant.id)
            if (data.drawn) {
              loadAssignment(myParticipant.id)
            }
          }
        }
      } else {
        alert('Gruppe nicht gefunden')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading group:', error)
    }
  }

  const loadAssignment = async (participantId: string) => {
    setLoadingAssignment(true)
    try {
      const response = await fetch(`/api/participants/${participantId}/assignment`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
      } else {
        const error = await response.json()
        console.error('Failed to load assignment:', error)
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
    } finally {
      setLoadingAssignment(false)
    }
  }

  const handleJoinGroup = async () => {
    setIsJoining(true)
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupCode: code }),
      })

      if (response.ok) {
        const participant = await response.json()
        setParticipantId(participant.id)
        loadGroup()
      } else {
        alert('Fehler beim Beitreten zur Gruppe. Bitte versuche es erneut.')
      }
    } catch (error) {
      console.error('Error joining group:', error)
      alert('Fehler beim Beitreten zur Gruppe. Bitte versuche es erneut.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleAddWish = async () => {
    if (!wishTitle || !participantId) return

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          title: wishTitle,
          description: wishDescription || null,
          url: wishUrl || null,
        }),
      })

      if (response.ok) {
        setWishTitle('')
        setWishDescription('')
        setWishUrl('')
        loadGroup()
      } else {
        alert('Fehler beim Hinzufügen des Wunsches. Bitte versuche es erneut.')
      }
    } catch (error) {
      console.error('Error adding wish:', error)
      alert('Fehler beim Hinzufügen des Wunsches. Bitte versuche es erneut.')
    }
  }

  const handleDrawSecretSanta = async () => {
    if (!group || group.participants.length < 2) {
      alert('Du benötigst mindestens 2 Teilnehmer zum Auslosen!')
      return
    }

    if (!confirm('Bist du sicher, dass du jetzt auslosen möchtest? Dies kann nicht rückgängig gemacht werden!')) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${group.id}/draw`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Das Wichteln wurde ausgelost! Jeder kann nun seine Zuteilung sehen.')
        // Reload group and assignment
        await loadGroup()
        if (participantId) {
          await loadAssignment(participantId)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Fehler beim Auslosen')
      }
    } catch (error) {
      console.error('Error drawing Secret Santa:', error)
      alert('Fehler beim Auslosen. Bitte versuche es erneut.')
    }
  }

  const handleDeleteWish = async (wishId: string) => {
    try {
      const response = await fetch(`/api/wishes?id=${wishId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadGroup()
      }
    } catch (error) {
      console.error('Error deleting wish:', error)
    }
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lädt...</p>
      </div>
    )
  }

  const currentParticipant = group.participants.find(p => p.id === participantId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Startseite
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Group Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl">{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription className="mt-2">{group.description}</CardDescription>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className="text-lg font-mono px-4 py-2 justify-center" variant="secondary">
                    {group.code}
                  </Badge>
                  {group.drawn && (
                    <Badge variant="default" className="bg-green-600 justify-center">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Ausgelost!
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.participants.length} Teilnehmer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dev Mode: Add Test Participants */}
          {process.env.NODE_ENV === 'development' && !group.drawn && (
            <DevTestParticipants groupCode={code} onParticipantsAdded={loadGroup} />
          )}

          {/* Participants List - Visible to everyone */}
          <Card>
            <CardHeader>
              <CardTitle>Teilnehmer ({group.participants.length})</CardTitle>
              <CardDescription>
                {participantId
                  ? 'Alle Mitglieder dieser Wichtel-Gruppe'
                  : 'Diese Personen sind bereits dabei - tritt auch bei!'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      participant.id === participantId
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{participant.anonymousName}</span>
                      {participant.id === participantId && (
                        <Badge variant="default" className="text-xs">Du</Badge>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {participant.wishes.length} Wunsch/Wünsche
                    </Badge>
                  </div>
                ))}
                {group.participants.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Noch keine Teilnehmer. Sei der Erste!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {!participantId ? (
            /* Join Group Card */
            <Card>
              <CardHeader>
                <CardTitle>Dieser Wichtel-Gruppe beitreten</CardTitle>
                <CardDescription>
                  Tritt der Gruppe bei und erhalte einen lustigen anonymen Namen!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                >
                  {isJoining ? 'Trete bei...' : 'Gruppe beitreten'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Current Participant Info */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    Willkommen, {currentParticipant?.anonymousName}!
                  </CardTitle>
                  <CardDescription>
                    Dein anonymer Name für diese Wichtel-Gruppe
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Assignment Card (if drawn) */}
              {group.drawn && (
                <>
                  {loadingAssignment ? (
                    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                      <CardContent className="py-8 text-center">
                        <p className="text-lg">Lade deine Zuteilung...</p>
                      </CardContent>
                    </Card>
                  ) : assignment ? (
                    <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CardHeader>
                        <CardTitle className="text-2xl text-green-700 dark:text-green-400 flex items-center gap-2">
                          <Gift className="h-6 w-6" />
                          Deine Wichtel-Zuteilung
                        </CardTitle>
                        <CardDescription>
                          Du beschenkst...
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h3 className="text-3xl font-bold mb-4">{assignment.receiver.anonymousName}</h3>
                        {assignment.receiver.wishes.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-lg">Wunschliste:</h4>
                            {assignment.receiver.wishes.map((wish) => (
                              <Card key={wish.id}>
                                <CardHeader>
                                  <CardTitle className="text-lg">{wish.title}</CardTitle>
                                </CardHeader>
                                {(wish.description || wish.url) && (
                                  <CardContent className="space-y-2">
                                    {wish.description && <p className="text-sm">{wish.description}</p>}
                                    {wish.url && (
                                      <a
                                        href={wish.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        Produkt ansehen
                                      </a>
                                    )}
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Diese Person hat noch keine Wünsche hinzugefügt.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-red-500 bg-red-50 dark:bg-red-950">
                      <CardContent className="py-8">
                        <p className="text-center text-lg mb-4">
                          Deine Zuteilung konnte nicht geladen werden.
                        </p>
                        <Button
                          onClick={() => participantId && loadAssignment(participantId)}
                          className="mx-auto block"
                          variant="outline"
                        >
                          Erneut versuchen
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* My Wishlist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Meine Wunschliste</CardTitle>
                  <CardDescription>
                    Füge Geschenke hinzu, die du dir von deinem Wichtel wünschst
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Wish Form */}
                  {!group.drawn && (
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold">Neuen Wunsch hinzufügen</h4>
                      <div className="space-y-2">
                        <Label htmlFor="wishTitle">Geschenkidee *</Label>
                        <Input
                          id="wishTitle"
                          placeholder="z.B. Brettspiel, Buch, Gadget..."
                          value={wishTitle}
                          onChange={(e) => setWishTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wishDescription">Beschreibung (Optional)</Label>
                        <Textarea
                          id="wishDescription"
                          placeholder="Füge mehr Details hinzu..."
                          value={wishDescription}
                          onChange={(e) => setWishDescription(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wishUrl">Produkt-Link (Optional)</Label>
                        <Input
                          id="wishUrl"
                          type="url"
                          placeholder="https://..."
                          value={wishUrl}
                          onChange={(e) => setWishUrl(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddWish} disabled={!wishTitle}>
                        Zur Wunschliste hinzufügen
                      </Button>
                    </div>
                  )}

                  {/* My Wishes */}
                  {currentParticipant?.wishes && currentParticipant.wishes.length > 0 ? (
                    <div className="space-y-3">
                      {currentParticipant.wishes.map((wish) => (
                        <Card key={wish.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{wish.title}</CardTitle>
                              {!group.drawn && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteWish(wish.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          {(wish.description || wish.url) && (
                            <CardContent className="space-y-2">
                              {wish.description && <p className="text-sm">{wish.description}</p>}
                              {wish.url && (
                                <a
                                  href={wish.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Produkt ansehen
                                </a>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Noch keine Wünsche hinzugefügt. Füge oben Geschenkideen hinzu!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Draw Secret Santa Button - Only visible to creator */}
              {!group.drawn && group.creatorId === session?.user?.id && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>Bereit zum Auslosen?</CardTitle>
                    <CardDescription>
                      Nach der Auslosung kann jeder seine Zuteilung sehen. Dies kann nicht rückgängig gemacht werden!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleDrawSecretSanta}
                      disabled={group.participants.length < 2}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Wichteln auslosen
                    </Button>
                    {group.participants.length < 2 && (
                      <p className="text-sm text-destructive mt-2 text-center">
                        Mindestens 2 Teilnehmer erforderlich
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
