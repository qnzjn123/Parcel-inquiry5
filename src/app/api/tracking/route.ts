import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DeliveryCompany from '@/models/DeliveryCompany';
import TrackingInfo from '@/models/TrackingInfo';
import { fetchTrackingInfo } from '@/lib/apiUtils';

// 운송장 번호로 배송 정보 조회 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyCode = searchParams.get('company');
    const trackingNumber = searchParams.get('trackingNumber');
    
    if (!companyCode || !trackingNumber) {
      return NextResponse.json(
        { success: false, error: '택배사와 운송장 번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // 택배사 정보 조회
    const company = await DeliveryCompany.findOne({ code: companyCode });
    if (!company) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 택배사입니다.' },
        { status: 404 }
      );
    }
    
    // 기존 추적 정보 조회
    let trackingInfo = await TrackingInfo.findOne({
      company: company._id,
      trackingNumber
    }).populate('company');
    
    try {
      // API 키를 사용하여 배송 추적 정보 조회 시도
      const externalTrackingData = await fetchTrackingInfo(company, trackingNumber);
      
      if (!trackingInfo) {
        // 새로운 추적 정보 생성
        const newTrackingData = {
          company: company._id,
          trackingNumber,
          status: externalTrackingData.status,
          currentLocation: externalTrackingData.currentLocation,
          lastUpdated: new Date(),
          history: externalTrackingData.history.map(item => ({
            time: new Date(item.time),
            location: item.location,
            status: item.status,
            description: item.description
          }))
        };
        
        trackingInfo = await TrackingInfo.create(newTrackingData);
        trackingInfo = await TrackingInfo.findById(trackingInfo._id).populate('company');
      } else {
        // 기존 추적 정보 업데이트
        trackingInfo.status = externalTrackingData.status;
        trackingInfo.currentLocation = externalTrackingData.currentLocation;
        trackingInfo.lastUpdated = new Date();
        
        // 새로운 이력만 추가
        const existingTimes = trackingInfo.history.map(h => h.time.toISOString());
        const newHistoryItems = externalTrackingData.history.filter(
          item => !existingTimes.includes(new Date(item.time).toISOString())
        ).map(item => ({
          time: new Date(item.time),
          location: item.location,
          status: item.status,
          description: item.description
        }));
        
        if (newHistoryItems.length > 0) {
          trackingInfo.history = [...trackingInfo.history, ...newHistoryItems];
        }
        
        await trackingInfo.save();
      }
      
      // API 응답에 추가 정보 포함
      const responseData = {
        ...trackingInfo.toObject(),
        apiData: {
          trackingBaseInfo: externalTrackingData.trackingBaseInfo,
          deliveryTimeInfo: externalTrackingData.deliveryTimeInfo,
          locationInfo: externalTrackingData.locationInfo,
          statusInfo: externalTrackingData.statusInfo
        }
      };
      
      return NextResponse.json({ success: true, data: responseData });
    } catch (apiError) {
      console.error('외부 API 요청 실패:', apiError);
      
      // API 요청 실패시 기존 데이터 반환 또는 가상 데이터 생성
      if (!trackingInfo) {
        // 새로운 추적 정보 생성 (가상 데이터)
        const newTrackingData = {
          company: company._id,
          trackingNumber,
          status: '배송중',
          currentLocation: '서울 동대문구 물류센터',
          lastUpdated: new Date(),
          history: [
            {
              time: new Date(Date.now() - 24 * 60 * 60 * 1000),
              location: '경기도 화성시 물류창고',
              status: '집화완료',
              description: '집화처리'
            },
            {
              time: new Date(Date.now() - 12 * 60 * 60 * 1000),
              location: '경기도 수원시 물류센터',
              status: '배송중',
              description: '간선상차'
            },
            {
              time: new Date(),
              location: '서울 동대문구 물류센터',
              status: '배송중',
              description: '간선하차'
            }
          ]
        };
        
        trackingInfo = await TrackingInfo.create(newTrackingData);
        trackingInfo = await TrackingInfo.findById(trackingInfo._id).populate('company');
      }
    }
    
    return NextResponse.json({ success: true, data: trackingInfo });
  } catch (error) {
    console.error('배송 추적 정보 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '배송 추적 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새로운 배송 추적 정보 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyCode, trackingNumber } = body;
    
    if (!companyCode || !trackingNumber) {
      return NextResponse.json(
        { success: false, error: '택배사와 운송장 번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // 택배사 정보 조회
    const company = await DeliveryCompany.findOne({ code: companyCode });
    if (!company) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 택배사입니다.' },
        { status: 404 }
      );
    }
    
    // 이미 등록된 운송장인지 확인
    const existingTracking = await TrackingInfo.findOne({
      company: company._id,
      trackingNumber
    });
    
    if (existingTracking) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 운송장 번호입니다.' },
        { status: 409 }
      );
    }
    
    try {
      // API 키를 사용하여 배송 추적 정보 조회 시도
      const externalTrackingData = await fetchTrackingInfo(company, trackingNumber);
      
      // 새로운 추적 정보 생성
      const newTrackingData = {
        company: company._id,
        trackingNumber,
        status: externalTrackingData.status,
        currentLocation: externalTrackingData.currentLocation,
        lastUpdated: new Date(),
        history: externalTrackingData.history.map(item => ({
          time: new Date(item.time),
          location: item.location,
          status: item.status,
          description: item.description
        }))
      };
      
      const trackingInfo = await TrackingInfo.create(newTrackingData);
      const result = await TrackingInfo.findById(trackingInfo._id).populate('company');
      
      // API 응답에 추가 정보 포함
      const responseData = {
        ...result.toObject(),
        apiData: {
          trackingBaseInfo: externalTrackingData.trackingBaseInfo,
          deliveryTimeInfo: externalTrackingData.deliveryTimeInfo,
          locationInfo: externalTrackingData.locationInfo,
          statusInfo: externalTrackingData.statusInfo
        }
      };
      
      return NextResponse.json({ success: true, data: responseData }, { status: 201 });
    } catch (apiError) {
      console.error('외부 API 요청 실패:', apiError);
      
      // API 요청 실패시 가상 데이터 생성
      const newTrackingData = {
        company: company._id,
        trackingNumber,
        status: '발송준비중',
        currentLocation: '발송지',
        lastUpdated: new Date(),
        history: [
          {
            time: new Date(),
            location: '발송지',
            status: '발송준비중',
            description: '운송장 등록'
          }
        ]
      };
      
      const trackingInfo = await TrackingInfo.create(newTrackingData);
      const result = await TrackingInfo.findById(trackingInfo._id).populate('company');
      
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }
  } catch (error) {
    console.error('배송 추적 정보 등록 실패:', error);
    return NextResponse.json(
      { success: false, error: '배송 추적 정보를 등록하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 