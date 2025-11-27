'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';
import api from '@/lib/api';
import { BsArrowRight } from "react-icons/bs";
import { useModal } from "@/context/ModalContext";

interface MainItem {
  id: number;
  itemId: number;
  itemNm: string;
  price: number;
  imgUrl: string;
  itemDetail: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert } = useModal();
  const [serverStatus, setServerStatus] = useState<'loading' | 'up' | 'down'>('loading');
  const [mainItems, setMainItems] = useState<MainItem[]>([]);

  useEffect(() => {
    const alertType = searchParams.get('alert');
    if (alertType === 'invalid_access') {
      showAlert("잘못된 접근입니다.");
      router.replace('/');
    } else if (alertType === 'admin_required') {
      showAlert("관리자 권한이 필요합니다.");
      router.replace('/');
    }
  }, [searchParams, router, showAlert]);

  useEffect(() => {
    const checkServerAndFetchItems = async () => {
      try {
        await api.get('/api/ping');
        setServerStatus('up');

        const response = await api.get('/api/main/items');
        
        if (Array.isArray(response.data)) {
          setMainItems(response.data);
        } else {
          setMainItems([]);
        }
      } catch (error: any) {
        console.error(error);
        if (error.response && error.response.status >= 500) {
          setServerStatus('down');
        } else {
          if (error.code === 'ERR_NETWORK' || !error.response) {
            setServerStatus('down');
          } else {
            setServerStatus('up');
          }
        }
      }
    };

    checkServerAndFetchItems();
  }, []);

  if (serverStatus === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium">잠시만 기다려 주세요...</p>
        </div>
      </div>
    );
  }

  if (serverStatus === 'down') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center px-6 py-12 bg-stone-50 rounded-lg border border-stone-200 max-w-md mx-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">서버 연결 실패</h2>
          <p className="text-stone-500 mb-6">
            현재 서비스 이용이 원활하지 않습니다.<br />
            잠시 후 다시 시도해 주세요.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-12">
      <section className="relative w-full rounded-2xl overflow-hidden bg-primary text-white shadow-xl mb-16">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative container mx-auto px-8 py-20 sm:py-28 text-center sm:text-left">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-sm bg-secondary/20 text-secondary border border-secondary/30 text-xs font-semibold tracking-widest mb-6">
              2025 S/S COLLECTION
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Discover Your <br/>
              <span className="text-secondary italic">Unique Style</span>
            </h1>
            <p className="text-lg text-stone-300 mb-10 leading-relaxed max-w-lg font-light">
              MUNSIKSA가 제안하는 감각적인 아이템으로<br className="sm:hidden"/> 당신의 일상에 특별함을 더하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link 
                href="/search" 
                className="px-10 py-4 bg-secondary text-white rounded-sm font-bold hover:bg-[#8d6945] transition-all transform shadow-lg flex items-center justify-center gap-3"
              >
                컬렉션 보기 <BsArrowRight className="text-xl"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between mb-8 px-2 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-primary">Editor's Pick</h2>
            <p className="text-stone-500 mt-2 text-sm">MUNSIKSA가 엄선한 추천 상품을 만나보세요.</p>
          </div>
        </div>

        {mainItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
            <p className="text-stone-400 text-lg font-medium">등록된 추천 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {mainItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/item/${item.itemId}`} 
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-stone-100 mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                  {item.imgUrl ? (
                    <img 
                      src={`http://localhost:8080${item.imgUrl}`} 
                      alt={item.itemNm}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300 bg-stone-100">
                      <span className="text-2xl text-stone-400 font-bold">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                <div className="flex justify-between items-start gap-2 px-1">
                  <div className="w-full">
                    <h3 className="text-lg font-medium text-stone-800 group-hover:text-primary transition-colors line-clamp-1">
                      {item.itemNm}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500 line-clamp-1 font-light">{item.itemDetail || '상품 설명이 없습니다.'}</p>
                  </div>
                </div>
                <div className="mt-2 px-1 border-t border-stone-100 pt-2 flex justify-between items-center">
                  <p className="text-lg font-bold text-stone-900">
                    {item.price.toLocaleString()}
                    <span className="text-sm font-normal text-stone-500 ml-1">원</span>
                  </p>
                  <span className="text-xs text-secondary font-bold uppercase tracking-wider">View</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}