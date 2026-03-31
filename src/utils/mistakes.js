const STORAGE_KEY = "opening-mistakes";

export function saveMistake(mistake) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  existing.push(mistake);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getMistakes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function clearMistakes() {
  localStorage.removeItem(STORAGE_KEY);
}
