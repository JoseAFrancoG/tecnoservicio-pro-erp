// Algoritmo estándar para generación de Código de Barras Code 128 (Subconjunto B)
// Cubre caracteres ASCII 32 a 127 (Letras mayúsculas, minúsculas, números y símbolos como '-')

const CODE128_B_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'                               // 100-106
];

const START_B = 104; // Código de inicio para Code 128 Set B
const STOP = 106;    // Código de fin

export interface BarcodeBar {
  x: number;
  width: number;
}

export function encodeCode128B(text: string): { bars: BarcodeBar[]; totalWidth: number } {
  // Limpiar texto a caracteres imprimibles ASCII 32 - 126
  const cleanText = text.replace(/[^\x20-\x7E]/g, '');
  
  const codes: number[] = [START_B];
  let checksum = START_B;

  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(STOP);

  // Convertir los códigos numéricos a la secuencia de anchos de barras y espacios
  let fullPattern = '';
  for (const c of codes) {
    if (c >= 0 && c < CODE128_B_PATTERNS.length) {
      fullPattern += CODE128_B_PATTERNS[c];
    }
  }

  // Generar las posiciones de las barras negras
  const bars: BarcodeBar[] = [];
  let currentX = 10; // Margen izquierdo
  let isBar = true;

  for (let i = 0; i < fullPattern.length; i++) {
    const width = parseInt(fullPattern[i], 10);
    if (isBar) {
      bars.push({ x: currentX, width });
    }
    currentX += width;
    isBar = !isBar;
  }

  return {
    bars,
    totalWidth: currentX + 10, // Margen derecho
  };
}
