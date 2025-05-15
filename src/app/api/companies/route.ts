import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DeliveryCompany from '@/models/DeliveryCompany';
import { seedDeliveryCompanies } from '@/lib/seed-data';

export async function GET() {
  try {
    await connectToDatabase();
    
    // 초기 데이터 삽입 시도
    await seedDeliveryCompanies();
    
    // 택배사 목록 조회
    const companies = await DeliveryCompany.find({}).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error('택배사 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '택배사 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 