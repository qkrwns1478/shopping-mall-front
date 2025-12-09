"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { OrderHist } from "@/types/order";

interface Member {
  name: string;
  email: string;
  address: string;
  birthday: string;
  points: number;
}

function MyPageContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<OrderHist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, ordersRes] = await Promise.all([api.get("/members/mypage"), api.get("/api/orders")]);

        setMember(memberRes.data);
        setOrders(ordersRes.data);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError("정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* 회원 정보 섹션 */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-gray-900">마이페이지</h2>
            <Link
              href="/mypage/check-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              정보 수정
            </Link>
          </div>

          {success && (
            <div
              className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200"
              role="alert"
            >
              회원 정보가 성공적으로 수정되었습니다.
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">보유 포인트</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 font-bold text-primary">
                    {member?.points?.toLocaleString() || 0} P
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">이름</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                    {member?.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">이메일</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {member?.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">주소</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {member?.address}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* 주문 내역 섹션 */}
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">주문 내역</h3>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-500 mb-4">주문 내역이 없습니다.</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition text-sm"
              >
                쇼핑하러 가기
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800 mr-3">{order.orderDate}</span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          order.orderStatus === "ORDER"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.orderStatus === "ORDER" ? "주문 완료" : "취소됨"}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      주문번호: {order.orderId}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {order.orderItemDtoList.map((item, idx) => (
                      <div key={idx} className="p-6 flex gap-4 items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                          {item.imgUrl ? (
                            <img
                              src={`http://localhost:8080${item.imgUrl}`}
                              alt={item.itemNm}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900 mb-1">
                            {item.itemNm}
                          </h4>
                          {item.optionName && (
                            <p className="text-sm text-gray-500 mb-1">
                              옵션: {item.optionName}
                            </p>
                          )}
                          <div className="flex gap-3 text-sm text-gray-600">
                            <span>{item.orderPrice.toLocaleString()}원</span>
                            <span className="text-gray-300">|</span>
                            <span>{item.count}개</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">총 결제 금액</span>
                    <span className="text-xl font-bold text-primary">
                      {order.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">로딩 중...</div>}>
      <MyPageContent />
    </Suspense>
  );
}