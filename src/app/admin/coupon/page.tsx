'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useModal } from "@/context/ModalContext";

export default function CouponAdminPage() {
  const { showAlert } = useModal();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountAmount: 0,
    validUntil: ''
  });

const isExpired = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/api/admin/coupons');
      setCoupons(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.validUntil) {
      showAlert('유효기간을 설정해주세요.');
      return;
    }
    try {
      await api.post('/api/admin/coupons', formData);
      showAlert('쿠폰이 생성되었습니다.');
      fetchCoupons();
      setFormData({ code: '', name: '', discountAmount: 0, validUntil: '' });
    } catch (e) {
      showAlert('생성 실패');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">쿠폰 관리</h2>
      
      {/* 쿠폰 생성 폼 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold mb-4">새 쿠폰 등록</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">쿠폰 코드</span>
              <input 
                type="text" 
                placeholder="예: SALE2024" 
                className="border p-2 rounded"
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})} 
                required 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">쿠폰 이름</span>
              <input 
                type="text" 
                placeholder="쿠폰 이름" 
                className="border p-2 rounded"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">할인 금액</span>
                <input 
                  type="number" 
                  placeholder="할인 금액" 
                  className="border p-2 rounded"
                  value={formData.discountAmount} 
                  onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})} 
                  required 
                />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">유효기간 설정</span>
                <input 
                  type="date" 
                  className="border p-2 rounded"
                  value={formData.validUntil} 
                  onChange={e => setFormData({...formData, validUntil: e.target.value})} 
                  required 
                />
            </div>
            <button type="submit" className="bg-primary text-white p-2 rounded hover:bg-primary-dark md:col-span-4 mt-2 font-bold">
                쿠폰 등록
            </button>
        </form>
      </div>

      {/* 목록 */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">할인액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유효기간</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map(c => {
              const expired = isExpired(c.validUntil);
              return (
                <tr key={c.id} className={expired ? "bg-gray-50 text-gray-400" : ""}>
                  <td className="px-6 py-4">
                    {expired ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        만료됨
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        진행중
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{c.code}</td>
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.discountAmount.toLocaleString()}원</td>
                  <td className="px-6 py-4">
                      {c.validUntil ? new Date(c.validUntil).toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}