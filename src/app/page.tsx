'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// API 키
const API_KEY = 'ba8322ba-8dff-4af9-a81b-a736dcad7626-614243f0de6fe70ba8ef5079';

// 택배사 타입 정의
interface DeliveryCompany {
  _id: string;
  name: string;
  code: string;
  trackingUrl: string;
  logoUrl?: string;
  companyInfoUrl: string;
  trackingNumberUrl: string;
  deliveryTimeUrl: string;
  currentLocationUrl: string;
  statusUrl: string;
  apiKey: string;
  apiKeyUrl: string;
}

// 배송 추적 타입 정의
interface TrackingHistory {
  _id?: string;
  time: string;
  location: string;
  status: string;
  description?: string;
}

interface TrackingInfo {
  _id: string;
  company: DeliveryCompany;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  lastUpdated: string;
  history: TrackingHistory[];
  apiData?: {
    trackingBaseInfo: any;
    deliveryTimeInfo: any;
    locationInfo: any;
    statusInfo: any;
  };
}

export default function Home() {
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingResult, setTrackingResult] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiData, setShowApiData] = useState<boolean>(false);

  // 택배사 목록 가져오기
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          setCompanies(result.data);
          setSelectedCompany(result.data[0].code);
        } else {
          setError('택배사 목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('택배사 목록을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      }
    };

    fetchCompanies();
  }, []);

  // 배송 추적 조회 처리
  const handleSearch = async () => {
    if (!selectedCompany || !trackingNumber) {
      setError('택배사와 운송장 번호를 모두 입력해주세요.');
      return;
    }

    setIsTracking(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/tracking?company=${selectedCompany}&trackingNumber=${trackingNumber}`
      );
      const result = await response.json();

      if (result.success) {
        setTrackingResult(result.data);
      } else {
        setError(result.error || '배송 정보를 조회하는 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('배송 정보를 조회하는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsTracking(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 상태에 따른 색상 지정
  const getStatusColor = (status: string) => {
    switch (status) {
      case '배송완료':
        return 'bg-green-500';
      case '배송중':
        return 'bg-blue-500';
      case '집화완료':
        return 'bg-yellow-500';
      case '배송실패':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // API 데이터 토글
  const toggleApiData = () => {
    setShowApiData(!showApiData);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">택배 조회 서비스</h1>
        <p className="text-gray-600 dark:text-gray-400">
          API 키를 활용한 정확한 배송 정보 조회
        </p>
        <div className="text-sm text-gray-500 mt-2">
          API 키: {API_KEY.substring(0, 10)}...
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="company" className="block mb-2 font-medium">
            택배사 선택
          </label>
          <select
            id="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {companies.map((company) => (
              <option key={company._id} value={company.code}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="trackingNumber" className="block mb-2 font-medium">
            운송장 번호
          </label>
          <div className="flex">
            <input
              type="text"
              id="trackingNumber"
              className="flex-1 block w-full rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="운송장 번호를 입력하세요"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              onClick={handleSearch}
              disabled={isTracking}
            >
              {isTracking ? '조회 중...' : '조회하기'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>* API 키를 사용하여 배송 정보를 조회합니다.</p>
          <p>* 택배사별 API와 연동하여 정확한 배송 정보를 제공합니다.</p>
        </div>
      </div>

      {isTracking && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isTracking && trackingResult && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
          {/* 배송 상태 헤더 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {trackingResult.company.name}
                </span>
                <h2 className="text-xl font-bold mt-1">{trackingResult.trackingNumber}</h2>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`${getStatusColor(trackingResult.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {trackingResult.status}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {formatDate(trackingResult.lastUpdated)}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">현재 위치</span>
              <p className="font-medium">{trackingResult.currentLocation}</p>
            </div>
            
            <div className="mt-4 flex justify-between">
              <a 
                href={`${trackingResult.company.trackingUrl}${trackingResult.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                택배사 홈페이지에서 보기
              </a>
              
              {trackingResult.apiData && (
                <button 
                  onClick={toggleApiData}
                  className="text-purple-500 hover:underline text-sm flex items-center"
                >
                  {showApiData ? '상세 API 데이터 숨기기' : '상세 API 데이터 보기'}
                </button>
              )}
            </div>
          </div>

          {/* API 상세 데이터 */}
          {showApiData && trackingResult.apiData && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-medium mb-3">API 상세 데이터</h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">추적 정보</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(trackingResult.apiData.trackingBaseInfo || '데이터 없음', null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">배송 시간</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(trackingResult.apiData.deliveryTimeInfo || '데이터 없음', null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">위치 정보</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(trackingResult.apiData.locationInfo || '데이터 없음', null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">상태 정보</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(trackingResult.apiData.statusInfo || '데이터 없음', null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>API 엔드포인트:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>택배사 정보: {trackingResult.company.companyInfoUrl}</li>
                  <li>운송장 추적: {trackingResult.company.trackingNumberUrl}</li>
                  <li>배송 시간: {trackingResult.company.deliveryTimeUrl}</li>
                  <li>현재 위치: {trackingResult.company.currentLocationUrl}</li>
                  <li>배송 상태: {trackingResult.company.statusUrl}</li>
                </ul>
              </div>
            </div>
          )}

          {/* 배송 히스토리 */}
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">배송 현황</h3>
            <div className="space-y-6">
              {trackingResult.history.map((item, index) => (
                <div key={item._id || index} className="relative">
                  {/* 타임라인 연결선 */}
                  {index < trackingResult.history.length - 1 && (
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  )}

                  <div className="flex gap-4">
                    {/* 상태 표시 원 */}
                    <div
                      className={`${getStatusColor(item.status)} h-6 w-6 rounded-full flex-shrink-0 z-10`}
                    ></div>

                    {/* 배송 정보 */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{item.status}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(item.time)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{item.location}</p>
                      {item.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isTracking && !trackingResult && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            운송장 번호를 입력하고 조회 버튼을 클릭하세요.
          </p>
        </div>
      )}

      <footer className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
        <p className="mb-1">© 2024 택배 조회 서비스. All rights reserved.</p>
        <p>API 키: {API_KEY.substring(0, 10)}...</p>
      </footer>
    </main>
  );
}
