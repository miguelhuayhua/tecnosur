"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { currencies } from '@/lib/currencies';

export function CurrencySelector() {
  const { selectedCurrency, updateCurrency, isLoading } = useCurrency();

  const handleCurrencyChange = (currencyCode: string) => {
    updateCurrency(currencyCode);
    // No necesitamos hacer nada más, el hook ya maneja el reload
  };

  

  return (
    <Select value={selectedCurrency.code} onValueChange={handleCurrencyChange}>
      <SelectTrigger 
        className="w-25   rounded-full "
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <img 
              src={selectedCurrency.flag} 
              alt={`${selectedCurrency.name} flag`} 
              className="h-3 w-4 rounded-sm object-cover"
            />
            <span className="text-xs font-medium ">{selectedCurrency.code}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent position='popper'>
        {currencies.map(currency => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <img 
                src={currency.flag} 
                alt={`${currency.name} flag`} 
                className="h-3 w-4 rounded-sm object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currency.code}</span>
                <span className="text-xs text-muted-foreground">{currency.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}