export function isEmailValid(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function requireValue(v){
  return v !== undefined && v !== null && String(v).trim().length > 0;
}
