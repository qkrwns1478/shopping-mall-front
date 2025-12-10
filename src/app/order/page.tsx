"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import api from "@/lib/api";
import { useModal } from "@/context/ModalContext";

declare global {
  interface Window {
    PortOne: any;
  }
}

interface MyCoupon {
  memberCouponId: number;
  name: string;
  amount: number;
  validUntil: string;
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, fetchCart, isLoading: isCartLoading } = useCart();
  const { showAlert } = useModal();

  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "", address: "" });
  const [usePoints, setUsePoints] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [payMethod, setPayMethod] = useState<"CARD" | "EASY_PAY">("CARD");
  const [myCoupons, setMyCoupons] = useState<MyCoupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<number | "">(""); 

  useEffect(() => {
    if (isCartLoading || isPaymentComplete) return;

    const itemsParam = searchParams.get("items");
    if (!itemsParam) {
      showAlert("주문할 상품 정보가 없습니다.");
      router.replace("/cart");
      return;
    }

    const selectedIds = itemsParam.split(",").map(Number);
    const filteredItems = cartItems.filter((item) => item.cartItemId && selectedIds.includes(item.cartItemId));

    if (filteredItems.length === 0) {
      showAlert("장바구니 정보가 갱신되었습니다. 다시 주문해주세요.");
      router.replace("/cart");
      return;
    }

    setOrderItems(filteredItems);

    api.get("/members/info")
      .then((res) => {
        if (!res.data.authenticated) {
          showAlert("로그인이 필요한 서비스입니다.");
          const returnUrl = encodeURIComponent(`/order?items=${itemsParam}`);
          router.replace(`/login?redirect=${returnUrl}`);
          return;
        }

        setUserInfo({
          name: res.data.name,
          email: res.data.email,
          phone: "010-1234-5678",
          address: res.data.address || "",
        });
        setMyPoints(res.data.points);
        setIsReady(true);
      })
      .catch((err) => {
        console.error(err);
        showAlert("로그인 정보를 확인하는 중 오류가 발생했습니다.");
        router.replace("/login");
      });
  }, [isCartLoading, cartItems, searchParams, router, showAlert, isPaymentComplete]);

  useEffect(() => {
    if (isReady) {
      api.get("/api/my-coupons")
        .then((res) => setMyCoupons(res.data))
        .catch((err) => console.error("쿠폰 목록 로드 실패:", err));
    }
  }, [isReady]);

  const productPrice = orderItems.reduce((acc, item) => {
    const price = item.isDiscount ? Math.floor(item.price * (1 - item.discountRate / 100)) : item.price;
    return acc + (price + item.optionPrice) * item.count;
  }, 0);

  const deliveryFee = orderItems.reduce((acc, item) => acc + item.deliveryFee, 0);

  const selectedCoupon = myCoupons.find((c) => c.memberCouponId === Number(selectedCouponId));
  const couponDiscount = selectedCoupon ? selectedCoupon.amount : 0;

  const finalPrice = Math.max(0, productPrice + deliveryFee - couponDiscount - usePoints);

  const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    
    const maxUseable = Math.max(0, productPrice + deliveryFee - couponDiscount);
    
    if (val > myPoints) val = myPoints;
    if (val > maxUseable) val = maxUseable;

    setUsePoints(val);
  };

  const requestCardPayment = async (paymentId: string) => {
    return await window.PortOne.requestPayment({
      storeId: process.env.NEXT_PUBLIC_STORE_ID,
      channelKey: process.env.NEXT_PUBLIC_CHANNEL_KEY,
      paymentId: paymentId,
      orderName:
        orderItems.length > 1 ? `${orderItems[0].itemNm} 외 ${orderItems.length - 1}건` : orderItems[0].itemNm,
      totalAmount: finalPrice,
      currency: "CURRENCY_KRW",
      payMethod: "CARD",
      customer: {
        fullName: userInfo.name,
        phoneNumber: userInfo.phone,
        email: userInfo.email,
        address: {
          addressLine1: userInfo.address,
          addressLine2: "",
        },
      },
    });
  };

  const requestKakaoPayment = async (paymentId: string) => {
    return await window.PortOne.requestPayment({
      storeId: process.env.NEXT_PUBLIC_STORE_ID,
      channelKey: process.env.NEXT_PUBLIC_CHANNEL_KEY,
      paymentId: paymentId,
      orderName:
        orderItems.length > 1 ? `${orderItems[0].itemNm} 외 ${orderItems.length - 1}건` : orderItems[0].itemNm,
      totalAmount: finalPrice,
      currency: "CURRENCY_KRW",
      payMethod: "EASY_PAY",
      easyPay: {
        easyPayProvider: "KAKAOPAY",
      },
      customer: {
        fullName: userInfo.name,
        phoneNumber: userInfo.phone,
        email: userInfo.email,
        address: {
          addressLine1: userInfo.address,
          addressLine2: "",
        },
      },
    });
  };

  const handlePayment = async () => {
    if (finalPrice > 0 && !window.PortOne) {
      showAlert("결제 모듈을 불러오지 못했습니다.");
      return;
    }

    const paymentId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      let response;

      if (finalPrice === 0) {
        response = {
          paymentId: `POINT-${paymentId}`,
          code: null,
        };
      } else {
        if (payMethod === "CARD") {
          response = await requestCardPayment(paymentId);
        } else {
          response = await requestKakaoPayment(paymentId);
        }
      }

      if (response.code != null) {
        showAlert(`결제 실패: ${response.message}`);
        return;
      }

      const verifyResponse = await api.post("/api/payment/complete", {
        paymentId: response.paymentId,
        orderId: paymentId,
        amount: finalPrice,
        usedPoints: usePoints,
        memberCouponId: selectedCouponId || null,
        orderItems: orderItems.map((item) => ({
          cartItemId: item.cartItemId,
          itemId: item.itemId,
          count: item.count,
          optionName: item.optionName,
          price: item.price,
        })),
      });

      if (verifyResponse.data.success) {
        setIsPaymentComplete(true);
        await fetchCart();
        router.replace("/order/complete");
      } else {
        showAlert(`주문 처리 실패: ${verifyResponse.data.message}`);
      }
    } catch (error: any) {
      console.error(error);
      showAlert("주문 중 오류가 발생했습니다.");
    }
  };

  if (!isReady) return <div className="text-center py-20">주문 정보 생성 중...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-3xl font-bold mb-8">주문/결제</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 상품 및 배송 정보 */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">주문 상품 ({orderItems.length}개)</h3>
            <div className="space-y-4">
              {orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 border-b border-stone-100 last:border-0 pb-4 last:pb-0"
                >
                  <img
                    src={`http://localhost:8080${item.imgUrl}`}
                    alt={item.itemNm}
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                  />
                  <div>
                    <p className="font-bold text-sm">{item.itemNm}</p>
                    <p className="text-xs text-stone-500">
                      {item.optionName} / {item.count}개
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {(item.isDiscount
                        ? Math.floor(item.price * (1 - item.discountRate / 100)) +
                          item.optionPrice
                        : item.price + item.optionPrice
                      ).toLocaleString()}
                      원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">배송지 정보</h3>
            <div className="space-y-3">
              <input
                type="text"
                className="w-full border p-2 rounded bg-gray-50"
                value={userInfo.name}
                readOnly
                title="이름"
              />
              <input
                type="text"
                className="w-full border p-2 rounded bg-gray-50"
                value={userInfo.phone}
                readOnly
                title="전화번호"
              />
              <input
                type="text"
                className="w-full border p-2 rounded bg-gray-50"
                value={userInfo.address}
                readOnly
                title="주소"
              />
            </div>
          </section>

          {/* 쿠폰 선택 섹션 */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">쿠폰 할인</h3>
            {myCoupons.length === 0 ? (
              <p className="text-gray-500 text-sm">사용 가능한 쿠폰이 없습니다.</p>
            ) : (
              <div className="relative">
                <select
                  className="w-full border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
                  value={selectedCouponId}
                  onChange={(e) => {
                    setSelectedCouponId(Number(e.target.value) || "");
                    setUsePoints(0);
                  }}
                >
                  <option value="">쿠폰을 선택해주세요 (보유: {myCoupons.length}장)</option>
                  {myCoupons.map((coupon) => (
                    <option key={coupon.memberCouponId} value={coupon.memberCouponId}>
                      {coupon.name} - {coupon.amount.toLocaleString()}원 할인
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            {selectedCoupon && (
              <p className="text-green-600 text-sm mt-2 font-medium">
                ✓ {selectedCoupon.amount.toLocaleString()}원 할인이 적용됩니다.
              </p>
            )}
          </section>

          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">포인트 사용</h3>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={usePoints}
                onChange={handlePointChange}
                className="flex-1 border p-2 rounded text-right"
              />
              <span className="text-sm whitespace-nowrap">
                P 사용 (보유: {myPoints.toLocaleString()} P)
              </span>
            </div>
            <button
              onClick={() => {
                const maxUseable = Math.max(0, productPrice + deliveryFee - couponDiscount);
                setUsePoints(Math.min(myPoints, maxUseable));
              }}
              className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
            >
              전액 사용
            </button>
          </section>

          {/* 결제 수단 선택 */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">결제 수단</h3>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                  payMethod === "CARD"
                    ? "border-primary bg-blue-50 text-primary ring-1 ring-primary"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="CARD"
                  checked={payMethod === "CARD"}
                  onChange={() => setPayMethod("CARD")}
                  className="hidden"
                />
                <span className="font-bold">일반 결제 (KG이니시스)</span>
              </label>

              <label
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                  payMethod === "EASY_PAY"
                    ? "border-yellow-400 bg-yellow-50 text-yellow-800 ring-1 ring-yellow-400"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="EASY_PAY"
                  checked={payMethod === "EASY_PAY"}
                  onChange={() => setPayMethod("EASY_PAY")}
                  className="hidden"
                />
                <span className="font-bold">카카오페이</span>
              </label>
            </div>
          </section>
        </div>

        {/* 결제 금액 요약 */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">최종 결제 금액</h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span>상품 금액</span>
                <span>{productPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span>+{deliveryFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-red-500 font-medium">
                <span>쿠폰 할인</span>
                <span>-{couponDiscount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-red-500 font-medium">
                <span>포인트 사용</span>
                <span>-{usePoints.toLocaleString()}원</span>
              </div>
            </div>
            <div className="flex justify-between border-t pt-4 mb-6">
              <span className="font-bold text-lg">총 결제금액</span>
              <span className="font-bold text-xl text-primary">{finalPrice.toLocaleString()}원</span>
            </div>
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-primary text-white rounded font-bold hover:bg-primary-dark transition text-lg shadow-md"
            >
              {payMethod === "EASY_PAY" ? "카카오페이로 결제하기" : "결제하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">페이지 로딩 중...</div>}>
      <OrderContent />
    </Suspense>
  );
}
