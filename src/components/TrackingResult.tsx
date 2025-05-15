import React from 'react';

// 모델 인터페이스
interface TrackingHistory {
  _id: string;
  time: string;
  location: string;
  status: string;
  description?: string;
}

interface Company {
  _id: string;
  name: string;
  code: string;
  trackingUrl: string;
  logoUrl?: string;
}

interface TrackingInfo {
  _id: string;
  company: Company;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  lastUpdated: string;
  history: TrackingHistory[];
}

interface TrackingResultProps {
  trackingInfo: TrackingInfo | null;
  isLoading: boolean;
  error: string | null;
}

const TrackingResult: React.FC<TrackingResultProps> = ({ trackingInfo, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">오류 발생</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          운송장 번호를 입력하고 조회 버튼을 클릭하세요.
        </p>
      </div>
    );
  }

  // 상태에 따른 배경색 설정
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* 배송 상태 헤더 */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {trackingInfo.company.name}
            </span>
            <h2 className="text-xl font-bold mt-1">{trackingInfo.trackingNumber}</h2>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`${getStatusColor(
                trackingInfo.status
              )} text-white px-3 py-1 rounded-full text-sm font-medium`}
            >
              {trackingInfo.status}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {formatDate(trackingInfo.lastUpdated)}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-gray-500 dark:text-gray-400 text-sm">현재 위치</span>
          <p className="font-medium">{trackingInfo.currentLocation}</p>
        </div>
      </div>

      {/* 배송 히스토리 */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">배송 현황</h3>
        <div className="space-y-6">
          {trackingInfo.history.map((item, index) => (
            <div key={item._id || index} className="relative">
              {/* 타임라인 연결선 */}
              {index < trackingInfo.history.length - 1 && (
                <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              )}

              <div className="flex gap-4">
                {/* 상태 표시 원 */}
                <div
                  className={`${getStatusColor(
                    item.status
                  )} h-6 w-6 rounded-full flex-shrink-0 z-10`}
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

      {/* 배송사 웹사이트 링크 */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <a
          href={`${trackingInfo.company.trackingUrl}${trackingInfo.trackingNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline block text-center"
        >
          {trackingInfo.company.name} 홈페이지에서 자세히 보기
        </a>
      </div>
    </div>
  );
};

export default TrackingResult; 