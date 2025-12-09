'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function OrderCompletePage() {
  const { fetchCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-4 text-stone-900">주문이 완료되었습니다!</h2>
        <p className="text-stone-600 mb-8 leading-relaxed">
          고객님의 주문이 성공적으로 처리되었습니다.<br />
          주문 내역은 마이페이지에서 확인하실 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/mypage" 
            className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-lg font-bold hover:bg-stone-50 transition text-center"
          >
            주문 내역 확인
          </Link>
          <Link 
            href="/" 
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition text-center shadow-md"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}