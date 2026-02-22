'use client'

import './roaster.css'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { HeroSection } from './HeroSection'
import { WalletStats } from './WalletStats'
import { RoastCard } from './RoastCard'
import { generateRoastFn } from '@/server/functions/roast'
import type { WalletData, Transaction, TokenBalance } from './types'

const API_BASE = 'https://testnet.arcscan.app/api/v2'
const USDC_CONTRACT = '0x3600000000000000000000000000000000000000'

type AppState = 'idle' | 'loading' | 'result' | 'error'

async function fetchJSON<T>(url: string, timeoutMs = 12000): Promise<T | null> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    clearTimeout(id)
    return null
  }
}

async function fetchWalletData(address: string): Promise<WalletData> {
  // Fire all three requests in parallel
  const [addressData, countersData, tokenData, txData] = await Promise.all([
    fetchJSON<Record<string, unknown>>(`${API_BASE}/addresses/${address}`),
    fetchJSON<Record<string, unknown>>(
      `${API_BASE}/addresses/${address}/counters`,
    ),
    fetchJSON<unknown>(`${API_BASE}/addresses/${address}/token-balances`),
    fetchJSON<{ items?: Transaction[] }>(
      `${API_BASE}/addresses/${address}/transactions?filter=to%20%7C%20from`,
    ),
  ])

  // --- Coin balance ---
  const coinBalance = String(addressData?.coin_balance ?? '0')

  // --- Transaction count from /counters ---
  // Blockscout /counters returns: { transactions_count: "1234", gas_usage_count: "...", ... }
  let txCount = 0
  if (countersData) {
    const raw =
      countersData['transactions_count'] ??
      countersData['transaction_count'] ??
      countersData['transactionsCount'] ??
      0
    txCount = parseInt(String(raw).replace(/,/g, ''), 10) || 0
  }

  // --- Recent transactions (for display / USDC activity check) ---
  const recentTxs: Transaction[] = txData?.items?.slice(0, 10) ?? []

  let firstTxDaysAgo: number | null = null
  if (recentTxs.length > 0) {
    const lastItem = recentTxs[recentTxs.length - 1]
    if (lastItem.timestamp) {
      const txDate = new Date(lastItem.timestamp)
      firstTxDaysAgo = (Date.now() - txDate.getTime()) / (1000 * 60 * 60 * 24)
    }
  }

  // --- Token balances ---
  const tokens: TokenBalance[] = Array.isArray(tokenData)
    ? (tokenData as TokenBalance[])
    : ((tokenData as { items?: TokenBalance[] } | null)?.items ?? [])

  const usdcToken = tokens.find(
    (t) =>
      t.token != null &&
      typeof t.token.address === 'string' &&
      t.token.address.toLowerCase() === USDC_CONTRACT.toLowerCase(),
  )
  const usdcDecimals = parseInt(usdcToken?.token?.decimals ?? '6', 10)
  const usdcBalance = usdcToken
    ? parseInt(usdcToken.value || '0') / Math.pow(10, usdcDecimals)
    : 0

  const hasUsdcActivity = recentTxs.some(
    (tx) =>
      tx.to?.hash?.toLowerCase() === USDC_CONTRACT.toLowerCase() ||
      tx.from?.hash?.toLowerCase() === USDC_CONTRACT.toLowerCase(),
  )

  return {
    address,
    txCount,
    tokenCount: tokens.length,
    usdcBalance,
    tokens,
    recentTxs,
    firstTxDaysAgo,
    hasUsdcActivity,
    coinBalance,
  }
}

export function WalletRoaster() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [roastText, setRoastText] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [currentAddress, setCurrentAddress] = useState<string>('')

  const handleRoast = async (address: string) => {
    setAppState('loading')
    setCurrentAddress(address)
    setErrorMsg('')

    try {
      const data = await fetchWalletData(address)
      setWalletData(data)

      const { roast } = await generateRoastFn({
        data: {
          address,
          txCount: data.txCount,
          tokenCount: data.tokenCount,
          usdcBalance: data.usdcBalance,
          totalTokenValue: 0,
          firstTxDaysAgo: data.firstTxDaysAgo,
          hasUsdcActivity: data.hasUsdcActivity,
          mostActiveDay: null,
        },
      })

      setRoastText(roast)
      setAppState('result')
    } catch (err) {
      console.error('Roast failed:', err)
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to analyze wallet. The blockchain is judging you.',
      )
      setAppState('error')
    }
  }

  const handleReset = () => {
    setAppState('idle')
    setWalletData(null)
    setRoastText('')
    setErrorMsg('')
  }

  return (
    <div className="roaster-app min-h-screen bg-zinc-950 text-white">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 noise-bg opacity-[0.03] pointer-events-none z-50" />

      <AnimatePresence mode="wait">
        {appState === 'idle' && (
          <motion.div
            key="hero"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <HeroSection onRoast={handleRoast} isLoading={false} />
          </motion.div>
        )}

        {appState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-t-2 border-orange-500 absolute inset-0 animate-spin" />
                <span className="text-3xl">🔥</span>
              </div>
            </div>
            <div className="text-center">
              <p className="title-font text-3xl text-white tracking-wider mb-2">
                ANALYZING...
              </p>
              <p className="mono-font text-zinc-500 text-sm">
                Digging through your on-chain skeletons
              </p>
              <p className="mono-font text-zinc-600 text-xs mt-1">
                {currentAddress.slice(0, 20)}...
              </p>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {['Fetching txs', 'Checking tokens', 'Crafting roast'].map(
                (step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.8, duration: 0.4 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs mono-font text-zinc-500"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    {step}
                  </motion.div>
                ),
              )}
            </div>
          </motion.div>
        )}

        {appState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
          >
            <div className="text-6xl">💀</div>
            <div className="text-center max-w-md">
              <p className="title-font text-4xl text-white tracking-wider mb-3">
                SOMETHING BROKE
              </p>
              <p className="body-font text-zinc-400 mb-2">{errorMsg}</p>
              <p className="mono-font text-zinc-600 text-sm">
                Even the error is judging you.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-orange-500/40 hover:text-white transition-all mono-font text-sm"
            >
              ← Try Again
            </button>
          </motion.div>
        )}

        {appState === 'result' && walletData && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-8"
          >
            {/* Result header */}
            <div className="text-center mb-10 px-4">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mono-font text-orange-400 text-xs uppercase tracking-widest mb-3"
              >
                Analysis Complete
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="title-font text-5xl md:text-6xl text-white tracking-wider"
              >
                YOUR ROAST IS READY
              </motion.h2>
            </div>

            {/* Roast first */}
            <RoastCard
              roast={roastText}
              address={walletData.address}
              onReset={handleReset}
            />

            {/* Stats below */}
            <div className="border-t border-zinc-800/60 pt-10 mt-4">
              <div className="text-center mb-6">
                <p className="mono-font text-zinc-600 text-xs uppercase tracking-widest">
                  The Evidence
                </p>
              </div>
              <WalletStats data={walletData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
