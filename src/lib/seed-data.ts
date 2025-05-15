import connectToDatabase from './mongodb';
import DeliveryCompany from '../models/DeliveryCompany';

// API 키 상수 - 사용자의 API 키
const API_KEY = 'ba8322ba-8dff-4af9-a81b-a736dcad7626-614243f0de6fe70ba8ef5079';

// 택배사 초기 데이터
const deliveryCompanies = [
  {
    name: 'CJ대한통운',
    code: 'cjlogistics',
    trackingUrl: 'https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=',
    logoUrl: '/images/cj.png',
    // 사용자 API 키 사용
    companyInfoUrl: `https://api.tracking.example.com/cj/info?key=${API_KEY}`,
    trackingNumberUrl: `https://api.tracking.example.com/cj/tracking?key=${API_KEY}`,
    deliveryTimeUrl: `https://api.tracking.example.com/cj/delivery-time?key=${API_KEY}`,
    currentLocationUrl: `https://api.tracking.example.com/cj/location?key=${API_KEY}`,
    statusUrl: `https://api.tracking.example.com/cj/status?key=${API_KEY}`,
    apiKey: API_KEY,
    apiKeyUrl: `https://api.tracking.example.com/auth?key=${API_KEY}`
  },
  {
    name: '우체국택배',
    code: 'koreapost',
    trackingUrl: 'https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.postal?sid1=',
    logoUrl: '/images/koreapost.png',
    // 사용자 API 키 사용
    companyInfoUrl: `https://api.tracking.example.com/koreapost/info?key=${API_KEY}`,
    trackingNumberUrl: `https://api.tracking.example.com/koreapost/tracking?key=${API_KEY}`,
    deliveryTimeUrl: `https://api.tracking.example.com/koreapost/delivery-time?key=${API_KEY}`,
    currentLocationUrl: `https://api.tracking.example.com/koreapost/location?key=${API_KEY}`,
    statusUrl: `https://api.tracking.example.com/koreapost/status?key=${API_KEY}`,
    apiKey: API_KEY,
    apiKeyUrl: `https://api.tracking.example.com/auth?key=${API_KEY}`
  },
  {
    name: '롯데택배',
    code: 'lotte',
    trackingUrl: 'https://www.lotteglogis.com/mobile/reservation/tracking/linkView?InvNo=',
    logoUrl: '/images/lotte.png',
    // 사용자 API 키 사용
    companyInfoUrl: `https://api.tracking.example.com/lotte/info?key=${API_KEY}`,
    trackingNumberUrl: `https://api.tracking.example.com/lotte/tracking?key=${API_KEY}`,
    deliveryTimeUrl: `https://api.tracking.example.com/lotte/delivery-time?key=${API_KEY}`,
    currentLocationUrl: `https://api.tracking.example.com/lotte/location?key=${API_KEY}`,
    statusUrl: `https://api.tracking.example.com/lotte/status?key=${API_KEY}`,
    apiKey: API_KEY,
    apiKeyUrl: `https://api.tracking.example.com/auth?key=${API_KEY}`
  },
  {
    name: '한진택배',
    code: 'hanjin',
    trackingUrl: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnumText2=',
    logoUrl: '/images/hanjin.png',
    // 사용자 API 키 사용
    companyInfoUrl: `https://api.tracking.example.com/hanjin/info?key=${API_KEY}`,
    trackingNumberUrl: `https://api.tracking.example.com/hanjin/tracking?key=${API_KEY}`,
    deliveryTimeUrl: `https://api.tracking.example.com/hanjin/delivery-time?key=${API_KEY}`,
    currentLocationUrl: `https://api.tracking.example.com/hanjin/location?key=${API_KEY}`,
    statusUrl: `https://api.tracking.example.com/hanjin/status?key=${API_KEY}`,
    apiKey: API_KEY,
    apiKeyUrl: `https://api.tracking.example.com/auth?key=${API_KEY}`
  },
  {
    name: 'CU 편의점택배',
    code: 'cupost',
    trackingUrl: 'https://www.cupost.co.kr/postbox/delivery/tracking.cupost?invoice_no=',
    logoUrl: '/images/cupost.png',
    // 사용자 API 키 사용
    companyInfoUrl: `https://api.tracking.example.com/cupost/info?key=${API_KEY}`,
    trackingNumberUrl: `https://api.tracking.example.com/cupost/tracking?key=${API_KEY}`,
    deliveryTimeUrl: `https://api.tracking.example.com/cupost/delivery-time?key=${API_KEY}`,
    currentLocationUrl: `https://api.tracking.example.com/cupost/location?key=${API_KEY}`,
    statusUrl: `https://api.tracking.example.com/cupost/status?key=${API_KEY}`,
    apiKey: API_KEY,
    apiKeyUrl: `https://api.tracking.example.com/auth?key=${API_KEY}`
  },
  // 사용자 API 키를 사용하는 통합 API 서비스
  {
    name: '통합배송추적API',
    code: 'userapi',
    trackingUrl: `https://tracking.example.com/?key=${API_KEY}&t_invoice=`,
    logoUrl: '/images/user_api.png',
    companyInfoUrl: `https://api.tracking.example.com/companies?key=${API_KEY}`,
    trackingNumberUrl: `https://api.tracking.example.com/tracking?key=${API_KEY}`,
    deliveryTimeUrl: `https://api.tracking.example.com/delivery-time?key=${API_KEY}`,
    currentLocationUrl: `https://api.tracking.example.com/location?key=${API_KEY}`,
    statusUrl: `https://api.tracking.example.com/status?key=${API_KEY}`,
    apiKey: API_KEY,
    apiKeyUrl: `https://api.tracking.example.com/auth?key=${API_KEY}`
  }
];

export async function seedDeliveryCompanies() {
  try {
    await connectToDatabase();
    
    // 기존 데이터 확인
    const existingCount = await DeliveryCompany.countDocuments();
    
    // 데이터가 없을 경우에만 초기 데이터 삽입
    if (existingCount === 0) {
      await DeliveryCompany.insertMany(deliveryCompanies);
      console.log('택배사 초기 데이터 삽입 완료');
    } else {
      // 기존 데이터가 있더라도 API 키 및 URL 정보 업데이트
      for (const company of deliveryCompanies) {
        await DeliveryCompany.updateOne(
          { code: company.code },
          { 
            $set: { 
              apiKey: company.apiKey,
              apiKeyUrl: company.apiKeyUrl,
              companyInfoUrl: company.companyInfoUrl,
              trackingNumberUrl: company.trackingNumberUrl,
              deliveryTimeUrl: company.deliveryTimeUrl,
              currentLocationUrl: company.currentLocationUrl,
              statusUrl: company.statusUrl
            } 
          },
          { upsert: true }
        );
      }
      
      // 스마트택배 API 엔트리 삭제
      await DeliveryCompany.deleteOne({ code: 'smartdelivery' });
      
      console.log('택배사 API 키 및 URL 정보 업데이트 완료');
    }
    
    return { success: true };
  } catch (error) {
    console.error('택배사 데이터 초기화 실패:', error);
    return { success: false, error };
  }
} 