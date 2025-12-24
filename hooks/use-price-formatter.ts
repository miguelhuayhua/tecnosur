"use client";

import { useCurrency } from './use-currency';

export const usePriceFormatter = () => {
  const { convertAndFormatPrice, selectedCurrency } = useCurrency();

  const formatPrice = (priceUSD: number) => {
    return convertAndFormatPrice(priceUSD);
  };

  return {
    formatPrice,
    selectedCurrency
  };
};