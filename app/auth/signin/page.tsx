'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Gift } from 'lucide-react'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Fehler beim Senden der E-Mail. Bitte versuche es erneut.')
      } else {
        router.push('/auth/verify-request')
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Gift className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Wichteln Wizard</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>
              Gib deine E-Mail-Adresse ein, um einen Anmeldelink zu erhalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine.email@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Wird gesendet...' : 'Anmeldelink senden'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Du erhältst eine E-Mail mit einem magischen Link</p>
              <p>zum Anmelden - kein Passwort erforderlich!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
