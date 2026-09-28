export interface NextCareStatus {
  nextDateStr: string; // YYYY-MM-DD
  formattedNextDate: string; // DD/MM/YYYY
  daysRemaining: number;
  statusText: string;
  isOverdue: boolean;
}

/**
 * Calculates the next care date based on last care date string and frequency in days.
 */
export function calculateNextCareDate(lastDateStr: string | undefined, frequencyDays: number = 7): NextCareStatus {
  if (!lastDateStr) {
    return {
      nextDateStr: '',
      formattedNextDate: 'Não registrada',
      daysRemaining: 0,
      statusText: 'Pendente',
      isOverdue: false,
    };
  }

  // Parse YYYY-MM-DD
  const parts = lastDateStr.split('-');
  let lastDate: Date;
  if (parts.length === 3) {
    lastDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    lastDate = new Date(lastDateStr);
  }

  if (isNaN(lastDate.getTime())) {
    return {
      nextDateStr: '',
      formattedNextDate: 'Inválida',
      daysRemaining: 0,
      statusText: 'Inválida',
      isOverdue: false,
    };
  }

  // Calculate next date
  const nextDate = new Date(lastDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);

  // Compare with today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextZero = new Date(nextDate);
  nextZero.setHours(0, 0, 0, 0);

  const diffTime = nextZero.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');

  const nextDateStr = `${year}-${month}-${day}`;
  const formattedNextDate = `${day}/${month}/${year}`;

  let statusText = '';
  let isOverdue = false;

  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    statusText = `Atrasado (${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}) - ${day}/${month}`;
    isOverdue = true;
  } else if (daysRemaining === 0) {
    statusText = `Hoje! (${day}/${month})`;
    isOverdue = true; // Needs care today
  } else if (daysRemaining === 1) {
    statusText = `Amanhã (${day}/${month})`;
  } else {
    statusText = `${day}/${month} (em ${daysRemaining} dias)`;
  }

  return {
    nextDateStr,
    formattedNextDate,
    daysRemaining,
    statusText,
    isOverdue,
  };
}
