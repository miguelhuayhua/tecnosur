export interface Country {
  code: string;        // Código ISO 3166-1 alpha-2
  name: string;        // Nombre del país en español
  flag: string;        // URL de la bandera
  phoneCode: string;   // Código de teléfono (prefijo)
}

export const spanishSpeakingCountries: Country[] = [
  // América Latina
  {
    code: 'AR',
    name: 'Argentina',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ar.svg',
    phoneCode: '+54'
  },
  {
    code: 'BO',
    name: 'Bolivia',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/bo.svg',
    phoneCode: '+591'
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/cl.svg',
    phoneCode: '+56'
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/co.svg',
    phoneCode: '+57'
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/cr.svg',
    phoneCode: '+506'
  },
  {
    code: 'CU',
    name: 'Cuba',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/cu.svg',
    phoneCode: '+53'
  },
  {
    code: 'DO',
    name: 'República Dominicana',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/do.svg',
    phoneCode: '+1-809, +1-829, +1-849'
  },
  {
    code: 'EC',
    name: 'Ecuador',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ec.svg',
    phoneCode: '+593'
  },
  {
    code: 'SV',
    name: 'El Salvador',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/sv.svg',
    phoneCode: '+503'
  },
  {
    code: 'GT',
    name: 'Guatemala',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gt.svg',
    phoneCode: '+502'
  },
  {
    code: 'HN',
    name: 'Honduras',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/hn.svg',
    phoneCode: '+504'
  },
  {
    code: 'MX',
    name: 'México',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/mx.svg',
    phoneCode: '+52'
  },
  {
    code: 'NI',
    name: 'Nicaragua',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ni.svg',
    phoneCode: '+505'
  },
  {
    code: 'PA',
    name: 'Panamá',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/pa.svg',
    phoneCode: '+507'
  },
  {
    code: 'PY',
    name: 'Paraguay',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/py.svg',
    phoneCode: '+595'
  },
  {
    code: 'PE',
    name: 'Perú',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/pe.svg',
    phoneCode: '+51'
  },
  {
    code: 'PR',
    name: 'Puerto Rico',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/pr.svg',
    phoneCode: '+1-787, +1-939'
  },
  {
    code: 'UY',
    name: 'Uruguay',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/uy.svg',
    phoneCode: '+598'
  },
  {
    code: 'VE',
    name: 'Venezuela',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ve.svg',
    phoneCode: '+58'
  },
  // España
  {
    code: 'ES',
    name: 'España',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/es.svg',
    phoneCode: '+34'
  },
  // Guinea Ecuatorial (África)
  {
    code: 'GQ',
    name: 'Guinea Ecuatorial',
    flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gq.svg',
    phoneCode: '+240'
  }
];

// Función para obtener un país por su código
export const getCountryByCode = (code: string): Country | undefined => {
  return spanishSpeakingCountries.find(country => country.code === code);
};

// Función para obtener país por código de teléfono
export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return spanishSpeakingCountries.find(country => 
    country.phoneCode.split(', ').some(code => phoneCode.startsWith(code.replace('+', '')))
  );
};

// Formatear número de teléfono con código de país
export const formatPhoneNumber = (number: string, countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  if (!country) return number;
  
  // Tomar el primer código de teléfono si hay múltiples
  const primaryPhoneCode = country.phoneCode.split(',')[0].trim();
  return `${primaryPhoneCode} ${number}`;
};

// Validar número de teléfono básico
export const isValidPhoneNumber = (number: string, countryCode: string): boolean => {
  const country = getCountryByCode(countryCode);
  if (!country) return false;
  
  // Eliminar espacios y guiones
  const cleanNumber = number.replace(/\D/g, '');
  
  // Validaciones básicas por país
  switch (countryCode) {
    case 'PE': // Perú: 9 dígitos
      return cleanNumber.length === 9;
    case 'MX': // México: 10 dígitos
      return cleanNumber.length === 10;
    case 'AR': // Argentina: 10 dígitos
      return cleanNumber.length === 10;
    case 'CO': // Colombia: 10 dígitos
      return cleanNumber.length === 10;
    case 'ES': // España: 9 dígitos
      return cleanNumber.length === 9;
    default:
      return cleanNumber.length >= 8 && cleanNumber.length <= 10;
  }
};

// Ordenar países alfabéticamente
export const sortedCountries = [...spanishSpeakingCountries].sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Ejemplo de uso
// const argentina = getCountryByCode('AR');
// console.log(argentina?.phoneCode); // '+54'
// 
// const phoneNumber = '987654321';
// const formatted = formatPhoneNumber(phoneNumber, 'PE');
// console.log(formatted); // '+51 987654321'