'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MyCouponPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/my-coupons?type=${activeTab}`)
      .then(res => setCoupons(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">내 쿠폰함</h2>

      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-bold ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('active')}
        >
          사용 가능 쿠폰
        </button>
        <button
          className={`px-6 py-3 font-bold ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          사용/만료 내역
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">로딩 중...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded bg-gray-50">
          쿠폰 내역이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((c) => (
            <div key={c.memberCouponId} className={`border rounded-lg p-6 relative overflow-hidden ${activeTab === 'history' ? 'bg-gray-50' : 'bg-white border-primary/30'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{c.name}</h3>
                <span className="text-xl font-bold text-primary">{c.amount.toLocaleString()}원</span>
              </div>
              <p className="text-sm text-gray-500">
                유효기간: {new Date(c.validUntil).toLocaleString()} 까지
              </p>
              
              {activeTab === 'history' && (
                <div className="absolute top-0 right-0 p-2">
                    {c.used ? (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">사용완료</span>
                    ) : (
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold">기한만료</span>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}