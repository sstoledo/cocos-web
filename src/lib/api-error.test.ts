import { describe, expect, it } from 'vitest';
import { ApiError, parseApiError } from './api-error';

describe('parseApiError', () => {
  it('keeps the status in the message and surfaces errorCode', async () => {
    const response = {
      status: 409,
      json: async () => ({
        message: 'Vehicle does not belong to client',
        errorCode: 'VEHICLE_CLIENT_MISMATCH',
      }),
    } as unknown as Response;

    const error = await parseApiError(response, 'Failed to create work order');

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Failed to create work order: 409');
    expect(error.status).toBe(409);
    expect(error.errorCode).toBe('VEHICLE_CLIENT_MISMATCH');
  });

  it('allows status matching via the message (F7.1 compatibility)', async () => {
    const response = {
      status: 404,
      json: async () => ({
        message: 'Not found',
        errorCode: 'CLIENT_NOT_FOUND',
      }),
    } as unknown as Response;

    const error = await parseApiError(response, 'Failed to fetch work order');

    expect(error.message.includes('404')).toBe(true);
  });

  it('omits errorCode when the body has none', async () => {
    const response = {
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    } as unknown as Response;

    const error = await parseApiError(response, 'Failed to create work order');

    expect(error.status).toBe(500);
    expect(error.errorCode).toBeUndefined();
  });

  it('falls back gracefully when the body is not JSON', async () => {
    const response = {
      status: 502,
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as Response;

    const error = await parseApiError(response, 'Failed to create work order');

    expect(error.message).toBe('Failed to create work order: 502');
    expect(error.errorCode).toBeUndefined();
  });
});
