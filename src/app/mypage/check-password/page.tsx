'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function CheckPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/members/edit/check', { password });

      if (response.data.success) {
        router.push('/mypage/edit');
      } else {
        setError(response.data.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setError('서버 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <h2 className="mb-4 text-3xl font-bold text-center text-gray-900">비밀번호 확인</h2>
          <p className="mb-8 text-center text-gray-500">
            회원님의 개인정보 보호를 위해 비밀번호를 다시 한 번 입력해주세요.
          </p>

          <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-bold text-gray-700">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 text-gray-700 border rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  required
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-bold text-white bg-primary rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                >
                  확인
                </button>
                <Link
                  href="/"
                  className="w-full px-4 py-2 font-bold text-center text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none transition duration-150"
                >
                  취소
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}