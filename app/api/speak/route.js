export const dynamic = 'force-dynamic'

// Rachel — warm, expressive, natural-sounding female voice
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

export async function POST(req) {
  const { text } = await req.json()
  if (!text) return new Response('Missing text', { status: 400 })

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return new Response('Missing ELEVENLABS_API_KEY', { status: 500 })

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.75,
            style: 0.55,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('ElevenLabs error:', err)
      return new Response(`ElevenLabs error: ${res.status}`, { status: 502 })
    }

    // Stream the audio directly back to the client
    return new Response(res.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Speak route error:', err.message)
    return new Response('TTS failed', { status: 500 })
  }
}
