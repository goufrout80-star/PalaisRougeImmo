import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export type AllowedRole = 'admin' | 'agent' | 'any'

export async function requireAuth(
  req: NextRequest,
  allowedRoles: AllowedRole[] = ['admin', 'agent']
): Promise<
  | { user: any; role: string; error: null }
  | { user: null; role: null; error: NextResponse }
> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } =
      await supabase.auth.getUser()

    if (error || !user) {
      return {
        user: null,
        role: null,
        error: NextResponse.json(
          { error: 'Non autorisé. Connexion requise.' },
          { status: 401 }
        ),
      }
    }

    const role = user.user_metadata?.role ?? 'user'

    if (
      !allowedRoles.includes('any') &&
      !allowedRoles.includes(role as AllowedRole)
    ) {
      return {
        user: null,
        role: null,
        error: NextResponse.json(
          { error: 'Accès refusé. Permissions insuffisantes.' },
          { status: 403 }
        ),
      }
    }

    return { user, role, error: null }
  } catch (err) {
    return {
      user: null,
      role: null,
      error: NextResponse.json(
        { error: 'Erreur d\'authentification.' },
        { status: 500 }
      ),
    }
  }
}
