import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Überprüfe deine E-Mails</CardTitle>
          <CardDescription>
            Wir haben dir einen Anmeldelink geschickt
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Klicke auf den Link in der E-Mail, um dich anzumelden.
            Der Link läuft nach 24 Stunden ab.
          </p>
          <p className="text-sm text-muted-foreground">
            Keine E-Mail erhalten? Überprüfe deinen Spam-Ordner.
          </p>
          <div className="pt-4">
            <Link href="/auth/signin" className="text-sm text-primary hover:underline">
              Zurück zur Anmeldung
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
