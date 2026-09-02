interface ApiErrorBody {
  message?: string;
  errorCode?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function parseApiError(
  response: Response,
  fallbackPrefix: string
): Promise<ApiError> {
  let body: ApiErrorBody | undefined;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = undefined;
  }

  return new ApiError(
    `${fallbackPrefix}: ${response.status}`,
    response.status,
    body?.errorCode
  );
}
