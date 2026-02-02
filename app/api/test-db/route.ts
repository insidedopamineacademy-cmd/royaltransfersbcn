import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time;`;
    
    // Count bookings
    const count = await sql`SELECT COUNT(*) as total FROM bookings;`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      currentTime: result.rows[0].current_time,
      totalBookings: count.rows[0].total,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}