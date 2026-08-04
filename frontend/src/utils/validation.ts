// Mirrors the CHECK constraints from the SQL DOMAINs. These are a UX
// convenience only - the backend/database remain authoritative.

export const PHONE_REGEX = /^\+7[0-9]{10}$/; // phone_domain
export const FIO_REGEX = /^[A-Za-zА-Яа-яЁё\- ]+$/; // fio_domain

export function validatePhone(value?: string | null): string | null {
  if (!value) return null;
  return PHONE_REGEX.test(value) ? null : "Формат: +7XXXXXXXXXX (10 цифр после +7)";
}

export function validateFio(value?: string | null, required = true): string | null {
  if (!value) return required ? "Обязательное поле" : null;
  return FIO_REGEX.test(value) ? null : "Только буквы, пробел и дефис";
}

export function validateHour(value?: number | null): string | null {
  if (value === null || value === undefined || value === ("" as any)) return null;
  return value >= 0 && value <= 23 ? null : "Значение от 0 до 23";
}

export function validatePositiveAmount(value?: number | null): string | null {
  if (value === null || value === undefined || value === ("" as any)) return "Обязательное поле";
  return value > 0 ? null : "Значение должно быть больше 0";
}

export function validatePercent(value?: number | null): string | null {
  if (value === null || value === undefined || value === ("" as any)) return null;
  return value >= 0 && value <= 100 ? null : "Значение от 0 до 100";
}

export function validateClosingHour(
  opening?: number | null,
  closing?: number | null
): string | null {
  if (opening == null || closing == null) return null;
  return closing > opening ? null : "Час закрытия должен быть позже часа открытия";
}
