import { motion } from 'motion/react'
import { Flame, RotateCcw, Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface RoastCardProps {
  roast: string
  address: string
  onReset: () => void
}

function formatRoast(text: string) {
  // Convert **bold** markdown and \n\n to paragraphs
  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/)
    return (
      <p key={i} className={`${i > 0 ? 'mt-4' : ''} leading-relaxed`}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="text-orange-400 font-semibold">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return <span key={j}>{part}</span>
        })}
      </p>
    )
  })
}

export function RoastCard({ roast, address, onReset }: RoastCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `My Arc testnet wallet ${address} just got roasted:\n\n${roast}\n\nGet yours at arcroaster.vercel.app`,
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const text = `My Arc testnet wallet just got absolutely ROASTED 🔥\n\n"${roast.slice(0, 200)}..."\n\nGet yours at arcroaster.vercel.app`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await handleCopy()
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-4 pb-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-zinc-900/80 border border-orange-500/20 backdrop-blur-sm"
      >
        {/* Flame header bar */}
        <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Flame size={16} className="fill-white text-white" />
            <span className="mono-font text-white/90 text-sm tracking-widest uppercase">
              Roast.exe — Arc Testnet Wallet Analysis
            </span>
            <Flame size={16} className="fill-white text-white" />
          </div>
        </div>

        {/* Terminal-style roast */}
        <div className="p-8 md:p-10">
          {/* Terminal prompt */}
          <div className="mono-font text-zinc-600 text-xs mb-6 flex items-center gap-2">
            <span className="text-green-500">$</span>
            <span>
              arc-roaster analyze --wallet {address.slice(0, 10)}... --mode
              brutal
            </span>
          </div>

          <div className="relative">
            {/* Glow effect behind text */}
            <div className="absolute inset-0 bg-orange-500/5 rounded-2xl blur-xl pointer-events-none" />

            <div className="relative body-font text-zinc-200 text-lg md:text-xl">
              {/* Roast icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="text-4xl mb-6"
              >
                🔥
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {formatRoast(roast)}
              </motion.div>
            </div>
          </div>

          {/* Terminal cursor */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1.2, duration: 1, repeat: 3, repeatDelay: 0 }}
            className="mono-font text-orange-500 mt-6 text-lg"
          >
            _
          </motion.div>
        </div>

        {/* Action bar */}
        <div className="px-8 pb-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm mono-font"
          >
            <RotateCcw size={14} />
            Roast Another
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all text-sm mono-font"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Roast'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400 transition-all text-sm mono-font ml-auto"
          >
            <Share2 size={14} />
            Share the Pain
          </button>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-center text-xs text-zinc-600 mono-font mt-6"
      >
        This roast is 100% automated and 100% accurate (results may vary) ·{' '}
        <a
          href={`https://testnet.arcscan.app/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-400 transition-colors underline underline-offset-2"
        >
          Verify on ArcScan
        </a>
      </motion.p>
    </motion.section>
  )
}
