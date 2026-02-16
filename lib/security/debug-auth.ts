import { NextRequest, NextResponse } from 'next/server';

/**
 * Restricts sensitive debug/test routes in production.
 * - In non-production: always allow.
 * - In production: require DEBUG_API_KEY + matching x-debug-key header.
 */
export function enforceDebugRouteAccess(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const expectedKey = process.env.DEBUG_API_KEY;
  const providedKey = request.headers.get('x-debug-key');

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Not found',
      },
      { status: 404 }
    );
  }

  return null;
}
