'use client'

import { Coins } from 'lucide-react'

interface CoinBalanceProps {
  balance: number
}

export function CoinBalance({ balance }: CoinBalanceProps) {
  return (
    <div className="rounded-2xl border p-6 shadow-sm bg-white flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Баланс</h3>
        <p className="text-2xl font-bold">{balance} 🪙</p>
      </div>
      <Coins className="w-10 h-10 text-yellow-500" />
    </div>
  )
}
