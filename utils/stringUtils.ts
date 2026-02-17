export const getIndexHeader = (reading: string): string => {
  if (!reading) return 'その他';
  
  // Get first character
  let char = reading.trim().charAt(0);
  
  // Convert Katakana to Hiragana
  const code = char.charCodeAt(0);
  if (code >= 0x30A1 && code <= 0x30F6) {
    char = String.fromCharCode(code - 0x60);
  }

  // Normalize: Dakuten/Handakuten removal, Small Kana to Large
  // Maps voiced/semi-voiced sounds to unvoiced, and small kana to normal size.
  // This ensures "Gatou" is under "Ka", "Pitsupa" is under "Hi", etc.
  const normalizeMap: Record<string, string> = {
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'か': 'か', 'が': 'か', 
    'き': 'き', 'ぎ': 'き', 
    'く': 'く', 'ぐ': 'く', 
    'け': 'け', 'げ': 'け', 
    'こ': 'こ', 'ご': 'こ',
    'さ': 'さ', 'ざ': 'さ', 
    'し': 'し', 'じ': 'し', 
    'す': 'す', 'ず': 'す', 
    'せ': 'せ', 'ぜ': 'せ', 
    'そ': 'そ', 'ぞ': 'そ',
    'た': 'た', 'だ': 'た', 
    'ち': 'ち', 'ぢ': 'ち', 
    'っ': 'つ', 'つ': 'つ', 'づ': 'つ', 
    'て': 'て', 'で': 'て', 
    'と': 'と', 'ど': 'と',
    'は': 'は', 'ば': 'は', 'ぱ': 'は', 
    'ひ': 'ひ', 'び': 'ひ', 'ぴ': 'ひ', 
    'ふ': 'ふ', 'ぶ': 'ふ', 'ぷ': 'ふ', 
    'へ': 'へ', 'べ': 'へ', 'ぺ': 'へ', 
    'ほ': 'ほ', 'ぼ': 'ほ', 'ぽ': 'ほ',
    'ゃ': 'や', 'や': 'や', 
    'ゅ': 'ゆ', 'ゆ': 'ゆ', 
    'ょ': 'よ', 'よ': 'よ',
    'ゎ': 'わ', 'わ': 'わ', 
    'ゐ': 'い', 'ゑ': 'え', 
    'を': 'を', 'ん': 'ん',
    'ゔ': 'う', 'ゝ': 'くりかえし', 'ゞ': 'くりかえし'
  };

  if (normalizeMap[char]) {
    return normalizeMap[char];
  }

  // Check if it is a valid Hiragana (and wasn't in the map for some reason)
  if (char >= '\u3041' && char <= '\u3096') {
    return char;
  }

  // Handle Alphabet (Group by letter)
  if (/^[a-zA-Z]/.test(char)) {
    return char.toUpperCase();
  }
  
  // Digits
  if (/^[0-9]/.test(char)) {
    return '0-9';
  }

  // Everything else
  return 'その他';
};
