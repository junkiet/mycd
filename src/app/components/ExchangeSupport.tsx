import { Check } from 'lucide-react';

export function ExchangeSupport() {
  const exchanges = [
    {
      name: 'Binance',
      types: ['Spot', 'Futures', 'Margin'],
      color: '#F3BA2F',
    },
    {
      name: 'Bybit',
      types: ['Spot', 'Futures', 'Options'],
      color: '#F7A600',
    },
    {
      name: 'OKX',
      types: ['Spot', 'Futures', 'Perpetual'],
      color: '#000000',
    },
    {
      name: 'Bitget',
      types: ['Spot', 'Futures', 'Copy Trading'],
      color: '#00F0FF',
    },
  ];

  return (
    <section className="border-b border-border/50 py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">Exchange Support</h2>
          <p className="text-xl text-muted-foreground">Connect all your trading accounts in one place</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {exchanges.map((exchange) => (
            <div
              key={exchange.name}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-secondary to-secondary/50 p-6 transition-all hover:border-[#BA7CFF]/50 hover:shadow-xl hover:shadow-[#BA7CFF]/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#BA7CFF]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#BA7CFF]/20">
                  <div className="text-2xl font-bold">{exchange.name[0]}</div>
                </div>

                <h3 className="mb-4 text-xl font-bold">{exchange.name}</h3>

                <div className="space-y-2">
                  {exchange.types.map((type) => (
                    <div key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#BA7CFF]" />
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
