export interface TokenBalance {
  token: {
    address?: string
    name?: string
    symbol?: string
    decimals?: string
    type?: string
  }
  value: string
}

export interface Transaction {
  hash: string
  from?: { hash?: string }
  to?: { hash?: string } | null
  value: string
  timestamp?: string
  status: string
  gas_used?: string
  fee?: { value: string }
}

export interface WalletData {
  address: string
  txCount: number
  tokenCount: number
  usdcBalance: number
  tokens: TokenBalance[]
  recentTxs: Transaction[]
  firstTxDaysAgo: number | null
  hasUsdcActivity: boolean
  coinBalance: string
}
