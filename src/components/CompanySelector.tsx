import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Company {
  _id: string;
  name: string;
  code: string;
  trackingUrl: string;
  logoUrl?: string;
}

interface CompanySelectorProps {
  selectedCompany: string;
  onSelect: (companyCode: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ selectedCompany, onSelect }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/companies');
        const result = await response.json();
        
        if (result.success) {
          setCompanies(result.data);
          // 회사가 있고 아직 선택된 회사가 없으면 첫 번째 회사 선택
          if (result.data.length > 0 && !selectedCompany) {
            onSelect(result.data[0].code);
          }
        } else {
          setError('택배사 목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('택배사 목록을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [selectedCompany, onSelect]);

  if (isLoading) return <div className="text-center py-4">택배사 목록을 불러오는 중...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
      {companies.map((company) => (
        <button
          key={company._id}
          className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
            selectedCompany === company.code
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          }`}
          onClick={() => onSelect(company.code)}
        >
          <div className="flex justify-center items-center h-12 w-12 mb-2">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {company.name.substring(0, 1)}
              </div>
            )}
          </div>
          <span className="text-sm font-medium">{company.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CompanySelector; 