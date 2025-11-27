'use client';

import Link from 'next/link';

export default function SignupSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-10 text-center">
            <div className="mb-6 flex justify-center">
              <img 
                src="https://media.tenor.com/VgCDirag6VcAAAAi/party-popper-joypixels.gif" 
                alt="success" 
                className="w-40 h-auto object-cover"
              />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              회원가입이 완료되었습니다!
            </h3>
            <p className="text-gray-600 mb-8">
              MUNSIKSA의 회원이 되신 것을 환영합니다.<br/>
              다양한 상품을 만나보세요.
            </p>

            <div className="flex flex-col gap-3">
              <Link 
                href="/login" 
                className="w-full px-4 py-3 font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                로그인 하러 가기
              </Link>
              <Link 
                href="/" 
                className="w-full px-4 py-3 font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                홈으로
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}