import { motion } from 'motion/react'
import {
  Activity,
  Coins,
  DollarSign,
  Hash,
  ExternalLink,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import type { WalletData, Transaction } from './types'

interface WalletStatsProps {
  data: WalletData
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function StatCard({
  icon,
  label,
  value,
  sub,
  delay,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  delay: number
  accent?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 overflow-hidden backdrop-blur-sm"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${accent ?? 'bg-orange-500'}`}
      />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400">
          {icon}
        </div>
      </div>
      <p className="text-zinc-500 text-xs mono-font uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="title-font text-3xl text-white tracking-wide">{value}</p>
      {sub && (
        <p className="text-zinc-500 text-xs mono-font mt-1 truncate">{sub}</p>
      )}
    </motion.div>
  )
}

function TxRow({
  tx,
  address,
  i,
}: {
  tx: Transaction
  address: string
  i: number
}) {
  const isOut = tx.from?.hash?.toLowerCase() === address.toLowerCase()
  const shortHash = `${tx.hash.slice(0, 10)}…`

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * i, duration: 0.4 }}
      className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0 group"
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-1.5 rounded-lg ${isOut ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
        >
          {isOut ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
        </div>
        <div>
          <p className="mono-font text-xs text-zinc-300">{shortHash}</p>
          <p className="text-zinc-600 text-xs mt-0.5">
            {isOut
              ? `→ ${shortAddress(tx.to?.hash ?? '0x000')}`
              : `← ${shortAddress(tx.from?.hash ?? '0x000')}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-xs mono-font px-2 py-0.5 rounded-full ${
            tx.status === 'ok'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {tx.status === 'ok' ? 'success' : 'failed'}
        </span>
        <a
          href={`https://testnet.arcscan.app/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 hover:text-orange-400 transition-colors"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </motion.div>
  )
}

export function WalletStats({ data }: WalletStatsProps) {
  const nativeBalance = parseFloat(
    (parseInt(data.coinBalance || '0') / 1e18).toFixed(4),
  ).toString()

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto px-4 pb-10"
    >
      {/* Address header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 mb-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
            {data.address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <p className="text-zinc-500 text-xs mono-font uppercase tracking-widest">
              Wallet Address
            </p>
            <p className="mono-font text-white text-sm">{data.address}</p>
          </div>
        </div>
        <a
          href={`https://testnet.arcscan.app/address/${data.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs mono-font text-orange-400 hover:text-orange-300 transition-colors border border-orange-500/20 rounded-lg px-3 py-1.5 hover:border-orange-500/40"
        >
          <ExternalLink size={12} />
          View on Explorer
        </a>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Activity size={16} />}
          label="Transactions"
          value={data.txCount.toLocaleString()}
          sub={
            data.firstTxDaysAgo !== null
              ? `${Math.round(data.firstTxDaysAgo)}d ago first tx`
              : 'No history'
          }
          delay={0.1}
          accent="bg-orange-500"
        />
        <StatCard
          icon={<DollarSign size={16} />}
          label="USDC Balance"
          value={nativeBalance}
          sub="Gas token (Arc testnet)"
          delay={0.2}
          accent="bg-green-500"
        />
        <StatCard
          icon={<Coins size={16} />}
          label="Token Types"
          value={data.tokenCount.toString()}
          sub={
            data.tokens
              .slice(0, 2)
              .map((t) => t.token.symbol)
              .join(', ') || 'None'
          }
          delay={0.3}
          accent="bg-blue-500"
        />
        <StatCard
          icon={<Hash size={16} />}
          label="Native Balance"
          value={nativeBalance}
          sub="ETH equivalent"
          delay={0.4}
          accent="bg-purple-500"
        />
      </div>

      {/* Tokens held */}
      {data.tokens.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers size={15} className="text-orange-400" />
            <h3 className="body-font text-white font-medium text-sm uppercase tracking-widest text-zinc-400">
              Tokens Held
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.tokens.map((t, i) => {
              const decimals = parseInt(t.token.decimals || '18', 10)
              const rawVal = Number(BigInt(t.value || '0'))
              const bal = (rawVal / Math.pow(10, decimals)).toLocaleString(
                'en-US',
                { maximumFractionDigits: 2 },
              )
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl"
                >
                  <span className="text-orange-400 mono-font text-xs font-bold">
                    {t.token.symbol || '???'}
                  </span>
                  <span className="text-zinc-500 mono-font text-xs">{bal}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Recent transactions */}
      {data.recentTxs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-orange-400" />
              <h3 className="body-font text-white font-medium text-sm uppercase tracking-widest text-zinc-400">
                Recent Transactions
              </h3>
            </div>
            <span className="mono-font text-xs text-zinc-600">
              Last {data.recentTxs.length}
            </span>
          </div>
          <div>
            {data.recentTxs.slice(0, 8).map((tx, i) => (
              <TxRow key={tx.hash} tx={tx} address={data.address} i={i} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  )
}
