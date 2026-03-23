export const fmtPrice = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
export const fmtDate = (d) => { const dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('pt-BR'); };
export const today = () => new Date().toISOString().split('T')[0];
export const addDays = (d, n) => { const dt = new Date(d + 'T12:00:00'); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };

export function generateTimeSlots(start = 9, end = 20, interval = 30) {
  const slots = [];
  for (let h = start; h < end; h++)
    for (let m = 0; m < 60; m += interval)
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  return slots;
}
