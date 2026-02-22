import { useState } from 'react'
import { motion } from 'motion/react'
import { Flame, Zap, Search } from 'lucide-react'

interface HeroSectionProps {
  onRoast: (address: string) => void
  isLoading: boolean
}

export function HeroSection({ onRoast, isLoading }: HeroSectionProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = address.trim()
    if (!trimmed) {
      setError('Enter a wallet address first, coward.')
      return
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      setError("That doesn't look like a valid Ethereum address. Nice try.")
      return
    }
    setError('')
    onRoast(trimmed)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow-2" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-mono mb-8"
        >
          <Zap size={13} className="fill-orange-400" />
          Arc Testnet · Powered by Blockscout API
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="title-font text-7xl md:text-9xl text-white leading-none tracking-wider mb-2"
        >
          WALLET
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
          <span className="title-font text-5xl md:text-7xl text-orange-400 tracking-widest">
            ROASTER
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="body-font text-zinc-400 text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
        >
          Drop your Arc testnet wallet address. We'll dig through your on-chain
          sins and deliver the roast you{' '}
          <em className="text-orange-400 not-italic font-medium">
            absolutely deserve
          </em>
          .
        </motion.p>

        {/* Input form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="w-full max-w-2xl"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/40 to-red-500/40 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-zinc-900/90 border border-zinc-700/80 rounded-2xl overflow-hidden backdrop-blur-sm">
              <Search
                size={18}
                className="absolute left-5 text-zinc-500 pointer-events-none"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setError('')
                }}
                placeholder="0x... paste your Arc testnet wallet address"
                className="mono-font flex-1 bg-transparent text-white placeholder-zinc-600 text-sm px-5 py-5 pl-12 outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 mr-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm transition-all duration-200 hover:from-orange-400 hover:to-red-400 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Flame size={15} className="fill-white" />
                    Roast Me
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-red-400 text-sm mono-font text-center"
            >
              ⚠ {error}
            </motion.p>
          )}
        </motion.form>

        {/* Scroll hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-10 text-zinc-600 text-xs mono-font"
        >
          No wallet data is stored · Reads from testnet.arcscan.app API
        </motion.p>
      </motion.div>
    </section>
  )
}
