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
    stock: 100
  });

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
    try {
      await api.post('/api/admin/coupons', formData);
      showAlert('쿠폰이 생성되었습니다.');
      fetchCoupons();
      setFormData({ code: '', name: '', discountAmount: 0, stock: 100 });
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
            <input type="text" placeholder="쿠폰 코드 (예: SALE2024)" className="border p-2 rounded"
              value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
            <input type="text" placeholder="쿠폰 이름" className="border p-2 rounded"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="number" placeholder="할인 금액" className="border p-2 rounded"
              value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})} required />
            <input type="number" placeholder="발급 수량" className="border p-2 rounded"
              value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
            <button type="submit" className="bg-primary text-white p-2 rounded hover:bg-primary-dark">등록</button>
        </form>
      </div>

      {/* 목록 */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">할인액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">남은수량</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4">{c.code}</td>
                <td className="px-6 py-4">{c.name}</td>
                <td className="px-6 py-4">{c.discountAmount}원</td>
                <td className="px-6 py-4">{c.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}