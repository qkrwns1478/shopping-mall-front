'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from '@/lib/api';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [serverStatus, setServerStatus] = useState<'loading' | 'up' | 'down'>('loading');

  useEffect(() => {
    const alertType = searchParams.get('alert');
    if (alertType === 'invalid_access') {
      alert("잘못된 접근입니다.");
      router.replace('/');
    } else if (alertType === 'admin_required') {
      alert("관리자 권한이 필요합니다.");
      router.replace('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await api.get('/members/info');
        setServerStatus('up');
      } catch (error: any) {
        if (error.response) {
          if (error.response.status >= 500) {
            setServerStatus('down');
          } else {
            setServerStatus('up');
          }
        } else {
          setServerStatus('down');
        }
      }
    };

    checkServerStatus();
  }, []);

  if (serverStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center text-center px-4">
        {serverStatus === 'up' ? (
          <>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              현재 준비 중입니다
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              MUNSIKSA 쇼핑몰은 현재 오픈 준비 중입니다.<br />
              조금만 기다려 주세요.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              서버 점검 중입니다
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              현재 서비스 이용이 원활하지 않습니다.<br />
              잠시 후 다시 시도해 주세요.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}