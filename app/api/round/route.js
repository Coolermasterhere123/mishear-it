import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Real, documented, famous mondegreens sourced from music publications,
// Reddit threads, and pop culture. These are actual mishearings real people reported.
const MONDEGREEN_DATABASE = [
  {
    song: "Purple Haze", artist: "Jimi Hendrix", year: 1967,
    misheardLine: "Excuse me while I kiss this guy",
    realLyric: "Excuse me while I kiss the sky",
    funFact: "This is arguably the most famous mondegreen of all time — so well-known that Hendrix himself started pointing at his bandmates during live performances when he sang that line."
  },
  {
    song: "Bad Moon Rising", artist: "Creedence Clearwater Revival", year: 1969,
    misheardLine: "There's a bathroom on the right",
    realLyric: "There's a bad moon on the rise",
    funFact: "John Fogerty eventually embraced this mishearing and started singing both versions in live shows. Fans would roar every time he said 'bathroom on the right.'"
  },
  {
    song: "Tiny Dancer", artist: "Elton John", year: 1971,
    misheardLine: "Hold me closer, Tony Danza",
    realLyric: "Hold me closer, tiny dancer",
    funFact: "The Friends episode where Phoebe sings 'Hold me close, young Tony Danza' cemented this mondegreen in pop culture forever. Elton John found it hilarious."
  },
  {
    song: "Blinded by the Light", artist: "Manfred Mann's Earth Band", year: 1976,
    misheardLine: "Wrapped up like a douche in the middle of the night",
    realLyric: "Revved up like a deuce, another runner in the night",
    funFact: "Widely called the most misheard lyric of all time. The original Bruce Springsteen line uses 1950s hot-rod slang ('deuce' = a '32 Ford), which confused generations of listeners."
  },
  {
    song: "Blank Space", artist: "Taylor Swift", year: 2014,
    misheardLine: "Got a long list of Starbucks lovers",
    realLyric: "Got a long list of ex-lovers",
    funFact: "This went so viral that 'Starbucks lovers' trended on Twitter and Taylor Swift herself acknowledged it, joking that she must be their best customer."
  },
  {
    song: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971,
    misheardLine: "There's a wino down the road",
    realLyric: "As we wind on down the road",
    funFact: "One of classic rock's most famous mishearings — the imagery of a wino somehow seemed fitting enough that many people sang it this way for years."
  },
  {
    song: "Livin' on a Prayer", artist: "Bon Jovi", year: 1986,
    misheardLine: "It doesn't make a difference if we're naked or not",
    realLyric: "It doesn't make a difference if we make it or not",
    funFact: "This mishearing spread massively online and became one of the most-shared mondegreen memes of the 2010s, with people insisting they could never unhear it."
  },
  {
    song: "Old Town Road", artist: "Lil Nas X ft. Billy Ray Cyrus", year: 2019,
    misheardLine: "Take my horse to the hotel room",
    realLyric: "Take my horse to the old town road",
    funFact: "The misheard version got over 160 million Google search results. People genuinely thought Lil Nas X was checking his horse into a hotel."
  },
  {
    song: "Africa", artist: "Toto", year: 1982,
    misheardLine: "There's nothing that a hundred men on Mars could ever do",
    realLyric: "There's nothing that a hundred men or more could ever do",
    funFact: "This mondegreen has been reported by so many people independently that it practically became an alternate version — lots of families now intentionally sing the Mars version."
  },
  {
    song: "Every Breath You Take", artist: "The Police", year: 1983,
    misheardLine: "I'll be washin' you",
    realLyric: "I'll be watching you",
    funFact: "Sting's phrasing on the chorus is so slurred that 'washing you' became one of the most commonly reported mishearings of the 80s."
  },
  {
    song: "Summer of '69", artist: "Bryan Adams", year: 1985,
    misheardLine: "I got my first real sex dream, I was five at the time",
    realLyric: "I got my first real six-string, bought it at the five-and-dime",
    funFact: "The words 'six-string' and 'five-and-dime' together create one of the most jaw-dropping mishearings in pop music — and it works perfectly with the song's nostalgic teenage theme."
  },
  {
    song: "Money for Nothing", artist: "Dire Straits", year: 1985,
    misheardLine: "Money for nothin' and chips for free",
    realLyric: "Money for nothin' and your chicks for free",
    funFact: "The 'chips' version is so beloved that many fans prefer it — chips do sound pretty good for free."
  },
  {
    song: "I'm a Believer", artist: "The Monkees", year: 1966,
    misheardLine: "Then I saw her face, now I'm gonna leave her",
    realLyric: "Then I saw her face, now I'm a believer",
    funFact: "This is a classic mondegreen that completely reverses the song's happy meaning — turning a love-at-first-sight anthem into a breakup song."
  },
  {
    song: "Every Time You Go Away", artist: "Paul Young", year: 1985,
    misheardLine: "Every time you go away, you take a piece of meat with you",
    realLyric: "Every time you go away, you take a piece of me with you",
    funFact: "The 'meat' version became so famous it was featured in comedy sketches and is now the first thing many people think of when they hear this 80s classic."
  },
  {
    song: "Higher Love", artist: "Steve Winwood", year: 1986,
    misheardLine: "Bake me a pie of love",
    realLyric: "Bring me a higher love",
    funFact: "A pie of love sounds genuinely delicious, which is probably why this mishearing stuck around so long."
  },
  {
    song: "I Wanna Be Sedated", artist: "The Ramones", year: 1978,
    misheardLine: "I want a piece of bacon",
    realLyric: "I wanna be sedated",
    funFact: "The Ramones' rapid-fire delivery made this one of punk's most misheard lines. 'Bacon' and 'sedated' sound nothing alike, but somehow it works at full speed."
  },
  {
    song: "Single Ladies", artist: "Beyoncé", year: 2008,
    misheardLine: "Singing lettuce, singing lettuce",
    realLyric: "Single ladies, single ladies",
    funFact: "Beyoncé's rapid, clipped pronunciation of 'single ladies' had millions of people hearing vegetables instead. It became one of the biggest viral mondegreens of the 2000s."
  },
  {
    song: "Ms. Jackson", artist: "OutKast", year: 2000,
    misheardLine: "I'm stuck in a taxi, ooh, I am for real",
    realLyric: "I'm sorry Ms. Jackson, ooh, I am for real",
    funFact: "André 3000's distinctive delivery of 'Ms. Jackson' sounds so much like 'stuck in a taxi' that this mishearing spread across multiple countries independently."
  },
  {
    song: "It's Gonna Be Me", artist: "NSYNC", year: 2000,
    misheardLine: "It's gonna be May",
    realLyric: "It's gonna be me",
    funFact: "Justin Timberlake confirmed he was asked to exaggerate the pronunciation of 'me' — which accidentally created one of the internet's longest-running memes, resurrected every April 30th."
  },
  {
    song: "Bohemian Rhapsody", artist: "Queen", year: 1975,
    misheardLine: "Beelzebub has a devil for a sideboard, for a sideboard, for a sideboard",
    realLyric: "Beelzebub has a devil put aside for me",
    funFact: "The operatic section of Bohemian Rhapsody created dozens of famous mishearings. The 'sideboard' version — imagining the devil owning a large piece of furniture — is the most beloved."
  },
  {
    song: "Come On Eileen", artist: "Dexys Midnight Runners", year: 1982,
    misheardLine: "Come on Ali",
    realLyric: "Come on Eileen",
    funFact: "A real person genuinely thought this classic was a tribute to Muhammad Ali for years — and honestly, it's an easy mistake given Kevin Rowland's thick Brummie accent."
  },
  {
    song: "Looks Like We Made It", artist: "Barry Manilow", year: 1977,
    misheardLine: "Looks like tomatoes",
    realLyric: "Looks like we made it",
    funFact: "Say 'we made it' in a Barry Manilow-style dramatic drawl and you'll hear 'tomatoes' immediately. This mishearing has made people laugh for four decades."
  }
]

const SYSTEM_PROMPT = `You are a music trivia game engine. You will be given a real documented mondegreen (misheard lyric). Your job is to generate 4 multiple-choice answers for it.

One answer must be the REAL lyric provided. The other 3 must be plausible-sounding fake options with similar syllable count and rhythm — convincing enough to fool someone.

Shuffle so the correct answer lands in a random position (a, b, c, or d).

Respond with ONLY raw JSON, no markdown, no backticks, nothing else.

{"context":"Short funny setup line under 12 words","choices":[{"id":"a","text":"option"},{"id":"b","text":"option"},{"id":"c","text":"option"},{"id":"d","text":"option"}],"correctId":"b"}`

async function generateChoices(entry) {
  const prompt = `Song: "${entry.song}" by ${entry.artist} (${entry.year})
Misheard line: "${entry.misheardLine}"
Real lyric: "${entry.realLyric}"

Generate a fun context line and 4 shuffled multiple choice answers. The real lyric must be one of the 4 choices at a random position.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 1.0,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq HTTP ${response.status}: ${errText}`)
  }

  const json = await response.json()
  const raw = json.choices?.[0]?.message?.content?.trim() || ''
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0])
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const usedSongs = searchParams.get('used')?.split(',').filter(Boolean) || []

  // Pick a random entry from the database that hasn't been used
  const available = MONDEGREEN_DATABASE.filter(
    entry => !usedSongs.some(used => used.toLowerCase().includes(entry.song.toLowerCase()))
  )

  if (available.length === 0) {
    // All used — reset and pick any
    const entry = MONDEGREEN_DATABASE[Math.floor(Math.random() * MONDEGREEN_DATABASE.length)]
    return buildRound(entry)
  }

  const entry = available[Math.floor(Math.random() * available.length)]

  try {
    const generated = await generateChoices(entry)
    return NextResponse.json({
      song: entry.song,
      artist: entry.artist,
      year: entry.year,
      misheardLine: entry.misheardLine,
      realLyric: entry.realLyric,
      funFact: entry.funFact,
      context: generated.context,
      choices: generated.choices,
      correctId: generated.correctId,
    })
  } catch (err) {
    console.error('Round error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
