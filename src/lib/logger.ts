'use client'

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('pr_session_id')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('pr_session_id', sid)
  }
  return sid
}

interface LogEvent {
  event_type: string
  event_category: string
  event_label?: string
  details?: Record<string, any>
  is_error?: boolean
  error_message?: string
}

async function log(event: LogEvent) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        session_id: getSessionId(),
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer || null,
      }),
    })
  } catch {
    // Silent fail — never break the app
  }
}

// ── PAGE TRACKING ──────────────────────────────
export function logPageView(pageName: string) {
  log({
    event_type: 'page_view',
    event_category: 'navigation',
    event_label: pageName,
    details: { path: window.location.pathname },
  })
}

// ── BUTTON CLICKS ──────────────────────────────
export function logWhatsAppClick(propertyTitle?: string, propertyId?: string) {
  log({
    event_type: 'whatsapp_click',
    event_category: 'contact',
    event_label: propertyTitle ?? 'General',
    details: { property_id: propertyId },
  })
}

export function logCallClick(propertyTitle?: string, propertyId?: string) {
  log({
    event_type: 'call_click',
    event_category: 'contact',
    event_label: propertyTitle ?? 'General',
    details: { property_id: propertyId },
  })
}

export function logContactFormOpen(source: string) {
  log({
    event_type: 'contact_form_open',
    event_category: 'contact',
    event_label: source,
  })
}

// ── FORM SUBMISSIONS ───────────────────────────
export function logContactSubmit(name: string, propertyTitle?: string) {
  log({
    event_type: 'contact_submitted',
    event_category: 'lead',
    event_label: name,
    details: { property: propertyTitle },
  })
}

export function logValuationSubmit(propertyType: string, location: string) {
  log({
    event_type: 'valuation_submitted',
    event_category: 'lead',
    event_label: `${propertyType} — ${location}`,
  })
}

export function logNewsletterSubscribe(email: string) {
  log({
    event_type: 'newsletter_subscribe',
    event_category: 'engagement',
    event_label: email,
  })
}

// ── PROPERTY INTERACTIONS ──────────────────────
export function logPropertyView(propertyId: string, propertyTitle: string) {
  log({
    event_type: 'property_view',
    event_category: 'property',
    event_label: propertyTitle,
    details: { property_id: propertyId },
  })
}

export function logPropertyShare(propertyId: string, propertyTitle: string) {
  log({
    event_type: 'property_share',
    event_category: 'property',
    event_label: propertyTitle,
    details: { property_id: propertyId },
  })
}

export function logSearchPerformed(filters: Record<string, any>, resultCount: number) {
  log({
    event_type: 'search_performed',
    event_category: 'search',
    event_label: JSON.stringify(filters),
    details: { filters, result_count: resultCount },
  })
}

// ── AUTH EVENTS ────────────────────────────────
export function logLogin(role: string, email: string) {
  log({
    event_type: 'user_login',
    event_category: 'auth',
    event_label: role,
    details: { email },
  })
}

export function logLogout(role: string) {
  log({
    event_type: 'user_logout',
    event_category: 'auth',
    event_label: role,
  })
}

// ── ADMIN/AGENT ACTIONS ────────────────────────
export function logAdminAction(
  action: string,
  entityType: string,
  entityTitle?: string,
  details?: Record<string, any>
) {
  log({
    event_type: action,
    event_category: 'admin_action',
    event_label: entityTitle,
    details: { entity_type: entityType, ...details },
  })
}

// ── ERRORS ─────────────────────────────────────
export function logError(errorMessage: string, context?: string) {
  log({
    event_type: 'client_error',
    event_category: 'error',
    event_label: context ?? 'unknown',
    is_error: true,
    error_message: errorMessage,
  })
}
