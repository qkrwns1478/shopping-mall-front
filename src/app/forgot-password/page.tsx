'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';

interface ForgotPasswordInputs {
  email: string;
  name: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInputs>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('name', data.name);

      const response = await api.post('/members/forgot-password', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.success) {
        setSuccessMsg(response.data.message || '이메일로 임시 비밀번호를 발송했습니다.');
      } else {
        setErrorMsg(response.data.message || '일치하는 회원 정보가 없습니다.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || '서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-gray-700 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">비밀번호 찾기</h2>
          
          <p className="text-center text-gray-600 mb-8 text-sm">
            가입하신 이메일과 이름을 입력하시면<br />임시 비밀번호를 전송해 드립니다.
          </p>

          <div className="bg-white shadow-md rounded-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-bold text-gray-700">이메일</label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@email.com"
                  className={inputClass}
                  {...register('email', { required: '이메일을 입력해주세요.' })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* 이름 입력 */}
              <div>
                <label htmlFor="name" className="block mb-1 text-sm font-bold text-gray-700">이름</label>
                <input
                  type="text"
                  id="name"
                  placeholder="가입시 등록한 이름"
                  className={inputClass}
                  {...register('name', { required: '이름을 입력해주세요.' })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* 결과 메시지 */}
              {successMsg && (
                <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* 전송 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 font-bold text-white bg-primary rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    전송 중...
                  </>
                ) : '임시 비밀번호 발송'}
              </button>

              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  로그인 하러 가기
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}