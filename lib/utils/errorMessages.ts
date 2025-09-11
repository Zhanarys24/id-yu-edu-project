export type BackendErrorShape = {
  detail?: string;
  message?: string;
  code?: string | number;
  non_field_errors?: string[];
  errors?: Array<{ code?: string; message?: string }>;
  [key: string]: unknown;
}

const codeToMessage: Record<string, string> = {
  UNAUTHORIZED: 'Требуется авторизация. Пожалуйста, войдите снова.',
  FORBIDDEN: 'Недостаточно прав для выполнения действия.',
  NOT_FOUND: 'Запрашиваемый ресурс не найден.',
  VALIDATION_ERROR: 'Проверьте правильность заполнения полей.',
  PASSWORD_INCORRECT: 'Текущий пароль неверный.',
  PASSWORD_TOO_SIMPLE: 'Пароль слишком простой. Используйте более надёжный.',
  PASSWORD_MISMATCH: 'Новые пароли не совпадают.',
  FILE_TOO_LARGE: 'Файл слишком большой.',
  FILE_TYPE_INVALID: 'Недопустимый тип файла.',
  TIMEOUT: 'Превышено время ожидания. Попробуйте ещё раз.',
  SERVER_ERROR: 'Произошла ошибка на сервере. Попробуйте позже.',
};

export function extractMessageFromBackend(json: BackendErrorShape, status?: number): string | undefined {
  if (!json || typeof json !== 'object') return undefined;
  if (json.detail && typeof json.detail === 'string') return json.detail;
  if (json.message && typeof json.message === 'string') return json.message;
  if (Array.isArray(json.non_field_errors) && json.non_field_errors.length) return json.non_field_errors[0];
  if (Array.isArray(json.errors) && json.errors.length && json.errors[0].message) return json.errors[0].message;
  // Django/DRF style field errors: { field: ['msg'] }
  for (const [k, v] of Object.entries(json)) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') return v[0];
  }
  if (status === 401) return codeToMessage.UNAUTHORIZED;
  if (status === 403) return codeToMessage.FORBIDDEN;
  if (status === 404) return codeToMessage.NOT_FOUND;
  if (status && status >= 500) return codeToMessage.SERVER_ERROR;
  return undefined;
}

export function mapErrorToFriendlyMessage(err: unknown, status?: number): string {
  try {
    if (typeof err === 'string') return err;
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === 'object' && err) {
      const obj = err as { code?: unknown; message?: unknown };
      if (typeof obj.code === 'string' && codeToMessage[obj.code]) return codeToMessage[obj.code];
      if (typeof obj.message === 'string') return obj.message;
    }
  } catch {}
  if (status === 408) return codeToMessage.TIMEOUT;
  return 'Что-то пошло не так. Попробуйте снова.';
}


