"use client";

import { useState, useEffect } from 'react';
import { Currency, currencies, getDefaultCurrency, getCurrencyByCode, convertAndRoundPrice, formatPrice, FormattedPrice } from '@/lib/currencies';

export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(getDefaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCurrencyCode = getCookie('selectedCurrency');
    if (savedCurrencyCode) {
      const currency = getCurrencyByCode(savedCurrencyCode);
      setSelectedCurrency(currency);
    }
    setIsLoading(false);
  }, []);

  const updateCurrency = (currencyCode: string) => {
    const currency = getCurrencyByCode(currencyCode);
    setSelectedCurrency(currency);
    setCookie('selectedCurrency', currencyCode, 30);
    window.location.reload();
  };

  const convertAndFormatPrice = (priceUSD: number): FormattedPrice => {
    const convertedPrice = convertAndRoundPrice(priceUSD, selectedCurrency);
    return formatPrice(convertedPrice, selectedCurrency);
  };

  const convertPrice = (priceUSD: number): number => {
    return convertAndRoundPrice(priceUSD, selectedCurrency);
  };

  return {
    selectedCurrency,
    updateCurrency,
    convertAndFormatPrice,
    convertPrice,
    isLoading,
  };
};

// Helper functions para cookies
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};