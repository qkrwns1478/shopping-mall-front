'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">관리자 대시보드</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 상품 관리 */}
        <Link href="/admin/item/list" className="block group">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-green-600 transition-colors">상품 관리</h3>
            <p className="text-gray-500 text-sm">
              등록된 상품 목록을 조회하고 수정하거나 삭제합니다.
            </p>
          </div>
        </Link>

        {/* 회원 관리 */}
        <Link href="/admin/member/list" className="block group">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">회원 관리</h3>
            <p className="text-gray-500 text-sm">
              가입된 회원 목록을 조회하고 관리합니다.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}