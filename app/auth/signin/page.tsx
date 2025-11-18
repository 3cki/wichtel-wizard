'use client'

import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Gift, Smartphone } from 'lucide-react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingCode(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Fehler beim Senden des Codes')
      } else {
        setCodeSent(true)
        setRemainingAttempts(data.remaining)
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyAndSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('phone', {
        phoneNumber,
        code,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Ungültiger Code. Bitte versuche es erneut.')
      } else {
        router.push(callbackUrl)
        router.refresh()
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
          <h1 className="text-3xl font-bold">Wichtel Wizard</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Anmelden
            </CardTitle>
            <CardDescription>
              Gib deine Telefonnummer ein, um einen Bestätigungscode zu erhalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefonnummer *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+49 123 4567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={isSendingCode}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: +49 für Deutschland (z.B. +491234567890)
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSendingCode}
                >
                  {isSendingCode ? 'Wird gesendet...' : 'Code per SMS senden'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Bestätigungscode *</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={isLoading}
                    maxLength={6}
                    pattern="\d{6}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Code wurde an {phoneNumber} gesendet
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCodeSent(false)
                      setCode('')
                      setError('')
                    }}
                    disabled={isLoading}
                  >
                    Zurück
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                  </Button>
                </div>

                {remainingAttempts !== null && (
                  <p className="text-xs text-muted-foreground text-center">
                    {remainingAttempts} Versuche übrig
                  </p>
                )}
              </form>
            )}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Sichere Authentifizierung per SMS 🔒</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Lädt...</p></div>}>
      <SignInForm />
    </Suspense>
  )
}
