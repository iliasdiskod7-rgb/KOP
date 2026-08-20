import type { ApiProblemDetails } from './types';

const ACCESS_TOKEN_STORAGE_KEY = 'kop-access-token';
const AUTH_USER_STORAGE_KEY = 'kop-auth-user';

type StoredAuthUser = {
  accessToken?: unknown;
};

type RequestOptions = {
  authenticated?: boolean;
  body?: unknown;
  method?: 'GET' | 'POST';
};

export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;

  constructor({ status, title, detail }: ApiProblemDetails) {
    super(detail || title);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
  }
}

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, '') ?? '';
}

export function getStoredAccessToken(): string | null {
  const directToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim();

  if (directToken) {
    return directToken;
  }

  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as StoredAuthUser;
    const nestedToken =
      typeof parsedUser.accessToken === 'string' ? parsedUser.accessToken.trim() : '';

    if (nestedToken) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, nestedToken);
      return nestedToken;
    }

    return null;
  } catch {
    return null;
  }
}

export function canUseAuthenticatedApi() {
  return Boolean(getApiBaseUrl() && getStoredAccessToken());
}

export function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function storeAccessToken(accessToken: string) {
  const normalizedToken = accessToken.trim();

  if (!normalizedToken) {
    throw new Error('Το backend δεν επέστρεψε έγκυρο access token.');
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, normalizedToken);
}

async function readProblemDetails(response: Response): Promise<ApiProblemDetails> {
  try {
    const problem = (await response.json()) as Partial<ApiProblemDetails>;

    return {
      status: typeof problem.status === 'number' ? problem.status : response.status,
      title: typeof problem.title === 'string' ? problem.title : response.statusText,
      detail:
        typeof problem.detail === 'string' && problem.detail.trim()
          ? problem.detail
          : 'Το backend επέστρεψε μη αναμενόμενο σφάλμα.',
    };
  } catch {
    return {
      status: response.status,
      title: response.statusText || 'API Error',
      detail: 'Το backend επέστρεψε μη αναμενόμενο σφάλμα.',
    };
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new ApiError({
      status: 0,
      title: 'API configuration missing',
      detail: 'Δεν έχει οριστεί το VITE_API_BASE_URL.',
    });
  }

  const authenticated = options.authenticated ?? true;
  const token = authenticated ? getStoredAccessToken() : null;

  if (authenticated && !token) {
    throw new ApiError({
      status: 401,
      title: 'Unauthorized',
      detail: 'Απαιτείται σύνδεση ή το token δεν είναι διαθέσιμο.',
    });
  }

  const headers = new Headers({ Accept: 'application/json' });

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new ApiError(await readProblemDetails(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string, authenticated = true) {
  return request<T>(path, { authenticated, method: 'GET' });
}

export function apiPost<TResponse, TBody>(path: string, body: TBody, authenticated = true) {
  return request<TResponse>(path, { authenticated, body, method: 'POST' });
}

export function getApiErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message.trim()
      ? error.message
      : 'Προέκυψε άγνωστο σφάλμα επικοινωνίας με το backend.';
  }

  if (error.status === 400) {
    return error.detail;
  }

  if (error.status === 401) {
    return 'Χρειάζεται νέα σύνδεση ή το token δεν είναι έγκυρο.';
  }

  if (error.status === 403) {
    return 'Δεν έχετε δικαίωμα για τη συγκεκριμένη ενέργεια.';
  }

  if (error.status === 409) {
    return error.detail || 'Υπάρχει σύγκρουση κατάστασης με την υποβολή.';
  }

  return error.detail || 'Προέκυψε άγνωστο σφάλμα επικοινωνίας με το backend.';
}
