import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const roastInputSchema = z.object({
  address: z.string().min(10),
  txCount: z.number(),
  tokenCount: z.number(),
  usdcBalance: z.number(),
  totalTokenValue: z.number(),
  firstTxDaysAgo: z.number().nullable(),
  hasUsdcActivity: z.boolean(),
  mostActiveDay: z.string().nullable(),
})

type RoastInput = z.infer<typeof roastInputSchema>

function pickRoast(data: RoastInput): string {
  const { txCount, tokenCount, usdcBalance, firstTxDaysAgo, hasUsdcActivity } =
    data

  const roasts: string[] = []

  // TX Count roasts
  if (txCount === 0) {
    roasts.push(
      "Zero transactions. Absolutely zero. You created a wallet, looked at it, and decided the blockchain wasn't worthy of your presence. Bold strategy, coward.",
    )
    roasts.push(
      "Your wallet is so empty and inactive, even the gas fees feel bad for you. You're basically a ghost — except ghosts at least rattle some chains.",
    )
  } else if (txCount < 3) {
    roasts.push(
      `${txCount} transaction${txCount === 1 ? '' : 's'}. Wow, a true power user. You've done more clicking on the "buy crypto" ads than actual on-chain activity. Your grandmother moves more assets.`,
    )
    roasts.push(
      `With ${txCount} transaction${txCount === 1 ? '' : 's'}, you're treating this testnet like a museum — just looking, never touching. The faucet called, it misses you.`,
    )
  } else if (txCount < 10) {
    roasts.push(
      `${txCount} transactions? That's... something. You've discovered the blockchain exists but haven't fully committed. Like someone who joined a gym and only went to take selfies in the parking lot.`,
    )
  } else if (txCount < 50) {
    roasts.push(
      `${txCount} transactions — not bad for someone who clearly Googled "what is a wallet" at least twice this week. You're testing the testnet, which is the correct use, so... congrats on following basic instructions?`,
    )
  } else if (txCount < 200) {
    roasts.push(
      `${txCount} transactions. Someone's been busy! Either you're a serious developer or you accidentally double-clicked the send button 80 times. The blockchain judges not.`,
    )
  } else {
    roasts.push(
      `${txCount} transactions?! You've basically proposed marriage to Arc testnet. At this point, Blockscout has a shrine to your wallet. Please touch grass. The trees miss you.`,
    )
    roasts.push(
      `With ${txCount} transactions, you're either building the next unicorn or you've lost a bet that required you to spam transactions. Either way, therapy is available.`,
    )
  }

  // USDC balance roasts
  if (usdcBalance === 0 && !hasUsdcActivity) {
    roasts.push(
      'Zero USDC. Not even testnet USDC. The faucet is free and you still managed to have nothing. This is actually impressive in the worst way.',
    )
  } else if (usdcBalance === 0 && hasUsdcActivity) {
    roasts.push(
      "You had USDC and now you have zero. Either you sent it all away like a philanthropist or you fumbled a testnet bag. On a testnet. Where it's free. Remarkable.",
    )
  } else if (usdcBalance > 0 && usdcBalance < 1) {
    roasts.push(
      `${usdcBalance.toFixed(4)} USDC. You're holding dust. Digital breadcrumbs. Your USDC balance is so small it needs a microscope to feel seen.`,
    )
  } else if (usdcBalance > 10000) {
    roasts.push(
      `${usdcBalance.toFixed(2)} testnet USDC? Hoarding fake money with the seriousness of a hedge fund manager. Your therapist is going to love this one.`,
    )
  }

  // Token count roasts
  if (tokenCount === 0) {
    roasts.push(
      'No tokens whatsoever. Your wallet is so empty, it has an echo. Even the dust bunnies left.',
    )
  } else if (tokenCount > 10) {
    roasts.push(
      `${tokenCount} different tokens? You're collecting testnet tokens like they're Pokémon. Gotta catch 'em all, apparently, even when they're worth exactly nothing.`,
    )
  }

  // Age roasts
  if (firstTxDaysAgo !== null) {
    if (firstTxDaysAgo < 1) {
      roasts.push(
        "Brand new wallet — welcome! You're fresh off the assembly line. Come back when you've made enough mistakes to be interesting.",
      )
    } else if (firstTxDaysAgo > 365) {
      roasts.push(
        `Over a year old and this is what you have to show for it? Your wallet has been around longer than some startups that actually shipped products. Just saying.`,
      )
    }
  }

  // Low effort roasts if nothing specific triggered
  if (roasts.length < 2) {
    const generic = [
      'Your on-chain footprint is so small, even the indexers had to squint.',
      "You're treating the Arc testnet with the same energy you treat your New Year's resolutions. Slow, sporadic, and probably abandoned by February.",
      "Not all heroes wear capes. Some of them just have mediocre wallets on Arc testnet. You're one of those.",
      "Your wallet activity reads like a resume written at 2am. Technically there's content, but no one's really impressed.",
    ]
    const idx = Math.floor(Math.random() * generic.length)
    roasts.push(generic[idx])
  }

  // Closing line
  const closings = [
    "\n\n🔥 **Verdict:** You're exactly the kind of wallet that makes auditors sleep easy — because there's nothing suspicious here. Just... nothing.",
    "\n\n🔥 **Verdict:** The Arc testnet has seen better wallets, but it's also seen worse. You're comfortably mediocre. Congratulations.",
    "\n\n🔥 **Verdict:** Don't be discouraged. Every blockchain legend started somewhere. You've started. That's... a start.",
    '\n\n🔥 **Verdict:** If your wallet were a movie, it would be a 90-minute loading screen. But hey — you showed up, and that counts for something.',
    '\n\n🔥 **Verdict:** Arc testnet thanks you for your (minimal) contribution. Your wallet has been noted, catalogued, and gently mocked.',
  ]

  const closingIdx =
    (txCount + tokenCount + Math.floor(usdcBalance)) % closings.length
  const closing = closings[closingIdx]

  // Pick 2 roasts and combine
  const shuffled = roasts.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 2)
  return selected.join('\n\n') + closing
}

export const generateRoastFn = createServerFn({ method: 'POST' })
  .inputValidator(roastInputSchema)
  .handler(async ({ data }) => {
    const roastText = pickRoast(data)
    return { roast: roastText }
  })
