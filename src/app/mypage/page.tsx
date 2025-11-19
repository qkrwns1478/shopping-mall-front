'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

interface Member {
  name: string;
  email: string;
  address: string;
  birthday: string;
}

export default function MyPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await api.get('/members/mypage');
        setMember(response.data);
      } catch (err: any) {
        console.error('Failed to fetch member info:', err);
        setError('회원 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">마이페이지</h2>

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200" role="alert">
            회원 정보가 성공적으로 수정되었습니다.
          </div>
        )}

        {/* 회원 정보 카드 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              내 정보
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              개인 정보 및 주소 확인
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              {/* 이름 */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">이름</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                  {member?.name}
                </dd>
              </div>

              {/* 이메일 */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">이메일</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {member?.email}
                </dd>
              </div>

              {/* 주소 */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500">주소</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {member?.address}
                </dd>
              </div>

              {/* 생년월일 */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">생년월일</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {member?.birthday || '입력되지 않음'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/mypage/check-password"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            정보 수정
          </Link>
        </div>
      </div>
    </div>
  );
}