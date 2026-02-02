import { NextResponse } from 'next/server';
   import { sql } from '@vercel/postgres';

   export async function GET() {
     try {
       const result = await sql`
         SELECT 
           booking_id,
           payment_method,
           payment_status,
           customer_email,
           total_price,
           created_at
         FROM bookings 
         ORDER BY created_at DESC 
         LIMIT 5;
       `;
       
       return NextResponse.json({
         success: true,
         bookings: result.rows,
       });
     } catch (error) {
       return NextResponse.json({
         success: false,
         error: error instanceof Error ? error.message : 'Unknown error',
       }, { status: 500 });
     }
   }