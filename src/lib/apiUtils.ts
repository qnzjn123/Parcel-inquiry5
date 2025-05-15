import axios from 'axios';
import { IDeliveryCompany } from '../models/DeliveryCompany';

// API 키 상수
const API_KEY = 'ba8322ba-8dff-4af9-a81b-a736dcad7626-614243f0de6fe70ba8ef5079';

/**
 * API 키를 사용하여 인증된 요청을 보내는 함수
 */
export async function sendAuthorizedRequest(url: string, apiKey: string, params: any = {}) {
  try {
    // 예제 API URL을 사용하는 경우
    if (url.includes('api.tracking.example.com')) {
      // API 키가 이미 URL에 포함되어 있는 경우
      if (url.includes('key=')) {
        const response = await axios.get(url, { params });
        return response.data;
      } 
      // API 키를 params에 추가해야 하는 경우
      else {
        params = { ...params, key: apiKey };
        const response = await axios.get(url, { params });
        return response.data;
      }
    } 
    // 일반적인 API 호출
    else {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params
      });
      return response.data;
    }
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}

/**
 * 배송 추적 정보를 가져오는 함수
 */
export async function fetchTrackingInfo(company: IDeliveryCompany, trackingNumber: string) {
  try {
    console.log(`API 키를 사용하여 ${company.name} 배송 정보를 조회합니다:`, company.apiKey);
    
    let trackingBaseInfo, deliveryTimeInfo, locationInfo, statusInfo;
    
    // 사용자의 통합 API 요청 - 모든 정보 가져오기 시도
    try {
      // 기본 추적 정보 요청
      trackingBaseInfo = await sendAuthorizedRequest(
        company.trackingNumberUrl,
        company.apiKey,
        { trackingNumber }
      );
      
      // 배송 시간 정보 요청
      deliveryTimeInfo = await sendAuthorizedRequest(
        company.deliveryTimeUrl,
        company.apiKey,
        { trackingNumber }
      );
      
      // 현재 위치 정보 요청
      locationInfo = await sendAuthorizedRequest(
        company.currentLocationUrl,
        company.apiKey,
        { trackingNumber }
      );
      
      // 배송 상태 정보 요청
      statusInfo = await sendAuthorizedRequest(
        company.statusUrl,
        company.apiKey,
        { trackingNumber }
      );
      
    } catch (err) {
      console.error(`${company.name} API 요청 실패, 가상 데이터 사용:`, err);
      return getFallbackTrackingData(company, trackingNumber);
    }
    
    // 모든 정보를 통합하여 반환
    return {
      trackingNumber,
      company: {
        _id: company._id,
        name: company.name,
        code: company.code,
        trackingUrl: company.trackingUrl
      },
      trackingBaseInfo,
      deliveryTimeInfo,
      locationInfo,
      statusInfo,
      // 기본 정보 (API 응답에서 추출)
      status: extractStatus(statusInfo, trackingBaseInfo),
      currentLocation: extractLocation(locationInfo, trackingBaseInfo),
      lastUpdated: new Date().toISOString(),
      history: extractHistory(trackingBaseInfo) || generateMockHistory(trackingNumber)
    };
  } catch (error) {
    console.error('배송 추적 정보 조회 실패:', error);
    return getFallbackTrackingData(company, trackingNumber);
  }
}

/**
 * API 응답에서 상태 정보 추출 (예제)
 */
function extractStatus(statusInfo: any, trackingBaseInfo: any): string {
  // API 응답에서 상태 추출 시도
  if (statusInfo && statusInfo.status) {
    return statusInfo.status;
  }
  
  if (trackingBaseInfo && trackingBaseInfo.status) {
    return trackingBaseInfo.status;
  }
  
  // 기본값 반환
  return '배송중';
}

/**
 * API 응답에서 위치 정보 추출 (예제)
 */
function extractLocation(locationInfo: any, trackingBaseInfo: any): string {
  // API 응답에서 위치 정보 추출 시도
  if (locationInfo && locationInfo.location) {
    return locationInfo.location;
  }
  
  if (trackingBaseInfo && trackingBaseInfo.location) {
    return trackingBaseInfo.location;
  }
  
  // 기본값 반환
  return '물류 처리 센터';
}

/**
 * API 응답에서 이력 정보 추출 (예제)
 */
function extractHistory(trackingBaseInfo: any): any[] | null {
  // API 응답에서 이력 정보 추출 시도
  if (trackingBaseInfo && trackingBaseInfo.trackingDetails) {
    return trackingBaseInfo.trackingDetails.map((item: any) => ({
      time: new Date(item.time || new Date()).toISOString(),
      location: item.location || '알 수 없음',
      status: item.status || '배송중',
      description: item.description || ''
    }));
  }
  
  if (trackingBaseInfo && trackingBaseInfo.history) {
    return trackingBaseInfo.history;
  }
  
  // 이력 정보가 없는 경우
  return null;
}

/**
 * API 호출 실패시 가상 데이터 반환 함수
 */
function getFallbackTrackingData(company: IDeliveryCompany, trackingNumber: string) {
  return {
    trackingNumber,
    company: {
      _id: company._id,
      name: company.name,
      code: company.code,
      trackingUrl: company.trackingUrl
    },
    trackingBaseInfo: { 
      message: `${API_KEY} API 키로 요청했으나 응답이 없어 가상 데이터를 표시합니다.` 
    },
    deliveryTimeInfo: { 
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() 
    },
    locationInfo: { 
      location: '서울 물류센터' 
    },
    statusInfo: { 
      status: '배송중',
      statusCode: 'in_transit' 
    },
    status: '배송중',
    currentLocation: '서울 물류센터',
    lastUpdated: new Date().toISOString(),
    history: generateMockHistory(trackingNumber)
  };
}

/**
 * 가상의 배송 이력 데이터 생성 함수
 */
function generateMockHistory(trackingNumber: string) {
  const now = new Date();
  const historyCount = (parseInt(trackingNumber.slice(-1)) % 5) + 2; // 운송장 번호 마지막 자리에 따라 2~6개 이력 생성
  
  const history = [];
  
  // 발송 준비 상태 추가 (항상 포함)
  history.push({
    time: new Date(now.getTime() - historyCount * 24 * 60 * 60 * 1000).toISOString(),
    location: '물류 센터',
    status: '발송준비중',
    description: '상품 포장 완료'
  });
  
  // 집화 완료 상태 추가 (항상 포함)
  history.push({
    time: new Date(now.getTime() - (historyCount - 1) * 24 * 60 * 60 * 1000).toISOString(),
    location: '경기도 화성시 물류창고',
    status: '집화완료',
    description: '집화처리'
  });
  
  // 중간 이력 생성 (1~4개)
  const locations = ['경기도 수원시 물류센터', '용인 허브', '강원도 원주 물류센터', '경북 대구 물류센터'];
  for (let i = 0; i < historyCount - 2; i++) {
    history.push({
      time: new Date(now.getTime() - (historyCount - 2 - i) * 24 * 60 * 60 * 1000).toISOString(),
      location: locations[i % locations.length],
      status: '배송중',
      description: i % 2 === 0 ? '간선상차' : '간선하차'
    });
  }
  
  // 가장 최근 상태 추가 (항상 포함)
  history.push({
    time: now.toISOString(),
    location: '서울 물류센터',
    status: '배송중',
    description: '배송지 이동 중'
  });
  
  return history;
} 