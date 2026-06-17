'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './page.module.css'

const TOTAL_ROUNDS = 7

// ── Web Speech fallback ──────────────────────────────────────────
function speakBrowser(text, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.88
  utt.pitch = 1.05
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
  ) || voices.find(v => v.lang.startsWith('en'))
  if (preferred) utt.voice = preferred
  utt.onend = () => onEnd?.()
  utt.onerror = () => onEnd?.()
  window.speechSynthesis.speak(utt)
}

// ── ElevenLabs via API route ─────────────────────────────────────
async function speakElevenLabs(text, onEnd, audioRef) {
  try {
    const res = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => { URL.revokeObjectURL(url); onEnd?.() }
    audio.onerror = () => { URL.revokeObjectURL(url); speakBrowser(text, onEnd) }
    audio.play()
  } catch (err) {
    console.warn('ElevenLabs TTS failed, falling back to browser TTS:', err.message)
    speakBrowser(text, onEnd)
  }
}

// ── Main Page ────────────────────────────────────────────────────
export default function Page() {
  const [phase, setPhase] = useState('title')
  const [round, setRound] = useState(null)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [roundNum, setRoundNum] = useState(0)
  const [usedSongs, setUsedSongs] = useState([])
  const [streak, setStreak] = useState(0)
  const [showFact, setShowFact] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const roundRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {}
      window.speechSynthesis.getVoices()
    }
  }, [])

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }

  const speakText = useCallback((text, onEnd) => {
    setSpeaking(true)
    const done = () => { setSpeaking(false); onEnd?.() }
    speakElevenLabs(text, done, audioRef)
  }, [])

  const fetchRound = useCallback(async () => {
    setPhase('loading')
    setSelected(null)
    setShowFact(false)
    setSpeaking(false)
    stopAudio()
    try {
      const used = roundRef.current
        ? [...usedSongs, `${roundRef.current.song} by ${roundRef.current.artist}`]
        : usedSongs
      const params = used.length ? `?used=${encodeURIComponent(used.join(','))}` : ''
      const res = await fetch(`/api/round${params}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRound(data)
      roundRef.current = data
      setPhase('reveal')
      // Auto-speak the misheard lyric
      setTimeout(() => speakText(data.misheardLine), 700)
    } catch (e) {
      setError(e.message || 'Unknown error')
      setPhase('error')
    }
  }, [usedSongs, speakText])

  const startGame = () => {
    setScore(0)
    setRoundNum(1)
    setUsedSongs([])
    setStreak(0)
    roundRef.current = null
    setError(null)
    fetchRound()
  }

  const handleChoice = (id) => {
    if (selected || speaking) return
    stopAudio()
    setSelected(id)
    const correct = id === round.correctId
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1) }
    else { setStreak(0) }
    setPhase('answered')
    // Speak the real lyric after a beat
    setTimeout(() => speakText(`The real lyric is: ${round.realLyric}`), 500)
  }

  const replayMisheard = () => {
    if (round && !speaking) speakText(round.misheardLine)
  }

  const nextRound = () => {
    if (roundNum >= TOTAL_ROUNDS) { setPhase('result'); return }
    setUsedSongs(prev => round ? [...prev, `${round.song} by ${round.artist}`] : prev)
    setRoundNum(n => n + 1)
    fetchRound()
  }

  const getChoiceClass = (choice) => {
    if (!selected) return `${styles.choice}${speaking ? ' ' + styles.choiceDisabled : ''}`
    if (choice.id === round.correctId) return `${styles.choice} ${styles.correct}`
    if (choice.id === selected && selected !== round.correctId) return `${styles.choice} ${styles.wrong}`
    return `${styles.choice} ${styles.dimmed}`
  }

  const getResultEmoji = () => {
    const pct = score / TOTAL_ROUNDS
    if (pct === 1) return '🏆 Perfect Pitch!'
    if (pct >= 0.7) return '🎸 Rock Star!'
    if (pct >= 0.5) return '🎵 Not Bad!'
    if (pct >= 0.3) return '🎤 Keep Singing!'
    return '🎧 Better luck next time!'
  }

  // ── TITLE ──
  if (phase === 'title') return (
    <div className={styles.page}>
      <div className={`${styles.titleScreen} animate-fade`}>
        <div className={styles.vinylWrap}>
          <div className={styles.vinyl}><div className={styles.vinylCenter} /></div>
        </div>
        <h1 className={styles.logo}>Mishear It!</h1>
        <p className={styles.tagline}>You've been singing it wrong your whole life.</p>
        <p className={styles.subTagline}>Listen to the misheard lyric — then pick the real one.</p>
        <button className={styles.startBtn} onClick={startGame}>🎤 Let's Play</button>
        <p className={styles.roundInfo}>{TOTAL_ROUNDS} rounds · Just tap A B C D · No typing</p>
      </div>
    </div>
  )

  // ── LOADING ──
  if (phase === 'loading') return (
    <div className={styles.page}>
      <div className={styles.loader}>
        <div className={styles.spinRecord} />
        <p className={styles.loadingText}>Finding misheard lyrics…</p>
      </div>
    </div>
  )

  // ── ERROR ──
  if (phase === 'error') return (
    <div className={styles.page}>
      <div className={styles.errorBox}>
        <p>😵 {error || 'Could not load a round'}</p>
        <button className={styles.startBtn} onClick={fetchRound}>Retry</button>
      </div>
    </div>
  )

  // ── RESULT ──
  if (phase === 'result') return (
    <div className={styles.page}>
      <div className={`${styles.resultScreen} animate-pop`}>
        <h2 className={styles.resultEmoji}>{getResultEmoji()}</h2>
        <p className={styles.resultScore}>{score} / {TOTAL_ROUNDS}</p>
        <p className={styles.resultSub}>songs correctly identified</p>
        <button className={styles.startBtn} onClick={() => setPhase('title')}>🔄 Play Again</button>
      </div>
    </div>
  )

  // ── GAME ROUND ──
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.roundBadge}>Round {roundNum}/{TOTAL_ROUNDS}</div>
        <div className={styles.scoreBadge}>⭐ {score}</div>
        {streak >= 2 && <div className={styles.streakBadge}>🔥 {streak} streak!</div>}
      </div>

      {round && (
        <div className={`${styles.card} animate-fade`}>
          <div className={styles.songInfo}>
            <span className={styles.songTitle}>{round.song}</span>
            <span className={styles.songArtist}> · {round.artist}</span>
            <span className={styles.songYear}> ({round.year})</span>
          </div>

          <p className={styles.context}>{round.context}</p>

          <div className={styles.misheardBox}>
            <div className={styles.misheardLabel}>👂 People hear:</div>
            <div className={styles.misheardRow}>
              <div className={styles.misheardText}>
                "{round.misheardLine}"
                {phase === 'answered' && <div className={styles.strikeBar} />}
              </div>
              <button
                className={`${styles.speakerBtn} ${speaking ? styles.speakerActive : ''}`}
                onClick={replayMisheard}
                title="Replay"
                disabled={speaking}
              >
                {speaking ? '🔊' : '▶️'}
              </button>
            </div>
            {speaking && (
              <div className={styles.speakingIndicator}>
                <span /><span /><span /><span />
              </div>
            )}
          </div>

          <p className={styles.question}>
            {speaking ? '🎧 Listen carefully…' : 'What are the REAL lyrics?'}
          </p>

          <div className={styles.choices}>
            {round.choices.map((choice, i) => (
              <button
                key={choice.id}
                className={getChoiceClass(choice)}
                onClick={() => handleChoice(choice.id)}
                disabled={!!selected}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <span className={styles.choiceId}>{choice.id.toUpperCase()}</span>
                <span className={styles.choiceText}>{choice.text}</span>
                {phase === 'answered' && choice.id === round.correctId && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>

          {phase === 'answered' && (
            <div className={`${styles.revealBox} animate-fade`}>
              <p className={styles.revealResult}>
                {selected === round.correctId
                  ? '🎉 Nailed it!'
                  : `❌ Real lyric: "${round.realLyric}"`}
              </p>
              <button className={styles.factToggle} onClick={() => setShowFact(f => !f)}>
                {showFact ? 'Hide' : '🎵 Fun Fact'}
              </button>
              {showFact && <p className={`${styles.funFact} animate-fade`}>{round.funFact}</p>}
              <button className={styles.nextBtn} onClick={nextRound}>
                {roundNum >= TOTAL_ROUNDS ? '🏁 See Results' : 'Next Song →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
