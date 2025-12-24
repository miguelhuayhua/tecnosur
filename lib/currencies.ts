export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number;
  roundingStrategy: 'nearest' | 'up' | 'down';
  roundingIncrement: number;
  decimalPlaces: number;
}

export const currencies: Currency[] = [
  {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg',
    exchangeRate: 1,
    roundingStrategy: 'nearest',
    roundingIncrement: 1,
    decimalPlaces: 2
  },
  {
    code: 'PEN',
    name: 'Sol Peruano',
    symbol: 'S/',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/pe.svg',
    exchangeRate: 3.37,
    roundingStrategy: 'nearest',
    roundingIncrement: 5,
    decimalPlaces: 0
  },
  {
    code: 'BOB',
    name: 'Boliviano',
    symbol: 'Bs',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/bo.svg',
    exchangeRate: 6.91,
    roundingStrategy: 'nearest',
    roundingIncrement: 0.5,
    decimalPlaces: 2
  },
  {
    code: 'MXN',
    name: 'Peso Mexicano',
    symbol: '$',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/mx.svg',
    exchangeRate: 17.50,
    roundingStrategy: 'nearest',
    roundingIncrement: 1,
    decimalPlaces: 2
  },
  {
    code: 'COP',
    name: 'Peso Colombiano',
    symbol: '$',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/co.svg',
    exchangeRate: 3900,
    roundingStrategy: 'nearest',
    roundingIncrement: 100,
    decimalPlaces: 0
  },
  {
    code: 'CLP',
    name: 'Peso Chileno',
    symbol: '$',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/cl.svg',
    exchangeRate: 890,
    roundingStrategy: 'nearest',
    roundingIncrement: 10,
    decimalPlaces: 0
  }
];

// Función para redondear precios de manera realista
export const roundPrice = (price: number, currency: Currency): number => {
  const { roundingStrategy, roundingIncrement, decimalPlaces } = currency;

  let rounded: number;

  switch (roundingStrategy) {
    case 'nearest':
      rounded = Math.round(price / roundingIncrement) * roundingIncrement;
      break;
    case 'up':
      rounded = Math.ceil(price / roundingIncrement) * roundingIncrement;
      break;
    case 'down':
      rounded = Math.floor(price / roundingIncrement) * roundingIncrement;
      break;
    default:
      rounded = Math.round(price / roundingIncrement) * roundingIncrement;
  }

  const factor = Math.pow(10, decimalPlaces);
  return Math.round(rounded * factor) / factor;
};

// Función para convertir y redondear precios
export const convertAndRoundPrice = (priceUSD: number, targetCurrency: Currency): number => {
  const converted = priceUSD * targetCurrency.exchangeRate;
  return roundPrice(converted, targetCurrency);
};

export const getDefaultCurrency = (): Currency => {
  return currencies.find(currency => currency.code === 'USD')!;
}

export const getCurrencyByCode = (code: string): Currency => {
  return currencies.find(currency => currency.code === code) || getDefaultCurrency();
}

// Nueva interfaz para el precio formateado
export interface FormattedPrice {
  code: string;
  value: string;
  full: string;
}

// Función para formatear precio retornando partes separadas
export const formatPrice = (price: number, currency: Currency): FormattedPrice => {
  const formattedValue = price.toFixed(currency.decimalPlaces);
  
  return {
    code: currency.code,
    value: formattedValue,
    full: `${currency.code} ${formattedValue}`
  };
};