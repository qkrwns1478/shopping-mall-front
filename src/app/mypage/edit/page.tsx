'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import api from '@/lib/api';
import { useModal } from "@/context/ModalContext";

declare global {
  interface Window {
    daum: any;
  }
}

interface EditProfileInputs {
  name: string;
  email: string;
  postcode: string;
  mainAddress: string;
  detailAddress: string;
  birthday: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { showAlert } = useModal();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditProfileInputs>();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/members/edit/form');
        const data = response.data;
        
        setValue('email', data.email);
        setValue('name', data.name);
        setValue('birthday', data.birthday);
        setValue('postcode', data.postcode);
        setValue('mainAddress', data.mainAddress);
        setValue('detailAddress', data.detailAddress);
        
        setLoading(false);
      } catch (error: any) {
        console.error(error);
        if (error.response?.status === 403) {
          showAlert('접근 권한이 없습니다. 비밀번호 확인이 필요합니다.');
          router.replace('/mypage/check-password');
        } else {
          showAlert('회원 정보를 불러오는데 실패했습니다.');
          router.push('/');
        }
      }
    };

    fetchUserData();
  }, [router, setValue]);

  /* 주소 검색 핸들러 */
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        let extraAddr = '';

        if(data.userSelectedType === 'R'){
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                extraAddr += data.bname;
            }
            if(data.buildingName !== '' && data.apartment === 'Y'){
                extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if(extraAddr !== ''){
                extraAddr = ' (' + extraAddr + ')';
            }
        }
        setValue('postcode', data.zonecode);
        setValue('mainAddress', addr + extraAddr);
        document.getElementById('detailAddress')?.focus();
      }
    }).open();
  };

  /* 정보 수정 제출 */
  const onSubmit = async (data: EditProfileInputs) => {
    setErrorMsg('');

    if (data.newPassword && data.newPassword !== data.newPasswordConfirm) {
      setErrorMsg('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    let fullAddress = '';
    if (data.postcode && data.mainAddress) {
        fullAddress = `(${data.postcode}) ${data.mainAddress}`;
        if (data.detailAddress) {
            fullAddress += `, ${data.detailAddress}`;
        }
    }

    const payload = {
        name: data.name,
        address: fullAddress,
        birthday: data.birthday || null,
        newPassword: data.newPassword,
        newPasswordConfirm: data.newPasswordConfirm
    };

    try {
      const response = await api.post('/members/edit/update', payload);
      if (response.data.success) {
        router.push('/mypage?success=true');
      } else {
        setErrorMsg(response.data.message || '수정에 실패했습니다.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  /* 회원 탈퇴 */
  const handleWithdraw = async () => {
    try {
      const response = await api.post('/members/withdraw', { password: withdrawPassword });
      if (response.data.success) {
        showAlert('탈퇴 처리되었습니다.');
        window.location.href = '/';
      } else {
        showAlert(response.data.message || '탈퇴 실패');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  const inputClass = "w-full px-3 py-2 text-gray-700 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
  const labelClass = "block mb-1 text-sm font-bold text-gray-700";

  return (
    <div className="container mx-auto px-4 py-12">
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">정보 수정</h2>

          <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 이메일 */}
              <div>
                <label className={labelClass}>이메일</label>
                <input
                  type="text"
                  className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                  readOnly
                  disabled
                  {...register('email')}
                />
              </div>

              {/* 이름 */}
              <div>
                <label className={labelClass}>이름</label>
                <input
                  type="text"
                  className={inputClass}
                  {...register('name', { required: '이름은 필수입니다.' })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* 주소 */}
              <div>
                <label className={labelClass}>주소</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="우편번호"
                    className={`${inputClass} bg-gray-50`}
                    readOnly
                    {...register('postcode', { required: true })}
                    onClick={handleAddressSearch}
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 whitespace-nowrap"
                  >
                    우편번호 찾기
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="기본 주소"
                  className={`${inputClass} bg-gray-50 mb-2`}
                  readOnly
                  {...register('mainAddress', { required: true })}
                  onClick={handleAddressSearch}
                />
                <input
                  id="detailAddress"
                  type="text"
                  placeholder="상세 주소"
                  autoComplete="off"
                  className={inputClass}
                  {...register('detailAddress')}
                />
                {(errors.postcode || errors.mainAddress) && <p className="mt-1 text-xs text-red-500">주소를 입력해주세요.</p>}
              </div>

              {/* 생년월일 */}
              <div>
                <label className={labelClass}>생년월일</label>
                <input
                  type="date"
                  className={inputClass}
                  {...register('birthday')}
                />
              </div>

              <hr className="border-gray-200 my-6" />

              {/* 비밀번호 변경 */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경 (선택)</h5>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>새 비밀번호</label>
                    <input
                      type="password"
                      className={inputClass}
                      autoComplete="new-password"
                      {...register('newPassword')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>새 비밀번호 확인</label>
                    <input
                      type="password"
                      className={inputClass}
                      autoComplete="new-password"
                      {...register('newPasswordConfirm')}
                    />
                  </div>
                </div>
              </div>

              {/* 에러 메시지 */}
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {errorMsg}
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="flex justify-between items-center pt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-4 py-2 font-medium text-red-600 bg-white border border-red-300 rounded shadow-sm hover:bg-red-50 transition"
                  >
                    회원 탈퇴
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white bg-blue-600 rounded shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 모달 */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">회원 탈퇴</h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-red-600 font-bold mb-4">정말로 탈퇴하시겠습니까?</p>
              <p className="text-sm text-gray-600 mb-4">탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다. 본인 확인을 위해 비밀번호를 입력해주세요.</p>
              <input
                type="password"
                className={inputClass}
                placeholder="비밀번호를 입력하세요"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}