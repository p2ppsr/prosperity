const USERCOM_ENDPOINT = 'https://usercom.babbage.systems/submit'

export async function submitFeedback(input: { message: string; email?: string; category: string }) {
  const response = await fetch(USERCOM_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'feedback',
      source: 'babbage-os',
      surface: 'system-tray',
      subject: `Babbage OS feedback: ${input.category}`,
      feedback: input.message.trim().slice(0, 5000),
      email: input.email?.trim().slice(0, 320) || undefined,
      tags: ['intent:babbage-os-feedback', `category:${input.category}`],
      context: { release: import.meta.env.VITE_RELEASE_SHA || 'development' }
    })
  })
  if (!response.ok) throw new Error('Feedback service did not accept the message.')
}
