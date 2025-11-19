'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoginError(null);

    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      const response = await api.post('/members/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success) {
        // 로그인 성공 시 메인으로 이동
        window.location.href = '/';
      } else {
        setLoginError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.response && error.response.data) {
        setLoginError(error.response.data.message || '이메일 또는 비밀번호를 확인해주세요.');
      } else {
        setLoginError('서버와 통신 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <h2 className="mb-6 text-3xl font-bold text-center text-gray-900">로그인</h2>

          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* 이메일 입력 */}
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-bold text-gray-700">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="email"
                  placeholder="email@example.com"
                  {...register('email', { required: '이메일을 입력해주세요.' })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-bold text-gray-700">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  className={`w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="current-password"
                  placeholder="******************"
                  {...register('password', { required: '비밀번호를 입력해주세요.' })}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* 에러 메시지 */}
              {loginError && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                  <span className="font-medium">오류!</span> {loginError}
                </div>
              )}

              {/* 로그인 버튼 */}
              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-300"
                >
                  로그인
                </button>
              </div>

              {/* 회원가입 버튼 */}
              <div className="mb-4">
                <Link
                  href="/signup"
                  className="block w-full px-4 py-2 font-bold text-center text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 focus:outline-none transition duration-300"
                >
                  회원가입
                </Link>
              </div>

              {/* 비밀번호 찾기 링크 */}
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="inline-block text-sm text-blue-500 align-baseline hover:text-blue-800"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}