'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs, ItemOption } from '@/types/item';
import { useModal } from "@/context/ModalContext";
import { useCart } from "@/context/CartContext";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();
  const { addToCart } = useCart();
  const itemId = params.itemId;

  const [item, setItem] = useState<ItemFormInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<ItemOption | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/api/item/${itemId}`);
        const data = response.data.data;
        setItem(data);
        if (data.imgUrlList && data.imgUrlList.length > 0) {
          setSelectedImage(data.imgUrlList[0]);
        }
      } catch (error: any) {
        console.error(error);
        showAlert(error.response?.data?.message || '상품 정보를 불러오는데 실패했습니다.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) fetchItem();
  }, [itemId, router, showAlert]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newValue = prev + delta;
      return newValue < 1 ? 1 : newValue;
    });
  };

  const handleOrder = async (type: 'cart' | 'buy') => {
    if (!item) return;
    if (item.itemSellStatus === 'SOLD_OUT') {
        showAlert('품절된 상품입니다.');
        return;
    }
    if (item.itemOptionList && item.itemOptionList.length > 0 && !selectedOption) {
        showAlert('옵션을 선택해주세요.');
        return;
    }
    
    if (type === 'cart') {
        const optionName = selectedOption ? selectedOption.optionName : '';
        const optionPrice = selectedOption ? selectedOption.extraPrice : 0;
        
        const cartItemData = {
            itemId: Number(itemId),
            itemNm: item.itemNm,
            price: item.price,
            count: quantity,
            imgUrl: item.imgUrlList && item.imgUrlList.length > 0 ? item.imgUrlList[0] : '',
            optionName: optionName,
            optionPrice: optionPrice,
            isDiscount: item.isDiscount,
            discountRate: item.discountRate,
            deliveryFee: item.deliveryFee
        };

        await addToCart(cartItemData);
        
        showConfirm('장바구니에 상품을 담았습니다.\n장바구니로 이동하시겠습니까?', () => {
            router.push('/cart');
        });
    } else {
        // TODO: 주문 기능 구현해야 함
        showAlert('구매 기능은 준비 중입니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) return null;

  const basePrice = item.isDiscount 
    ? Math.floor(item.price * (1 - item.discountRate / 100)) 
    : item.price;

  const optionExtraPrice = selectedOption ? selectedOption.extraPrice : 0;
  const totalPrice = (basePrice + optionExtraPrice) * quantity;

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-sm bg-stone-100 relative border border-stone-200">
            {selectedImage ? (
              <img 
                src={`http://localhost:8080${selectedImage}`} 
                alt={item.itemNm}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                이미지 없음
              </div>
            )}
            {item.itemSellStatus === 'SOLD_OUT' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold border-2 border-white px-6 py-2">SOLD OUT</span>
                </div>
            )}
          </div>
          
          {item.imgUrlList && item.imgUrlList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.imgUrlList.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(url)}
                  className={`relative w-20 aspect-square flex-shrink-0 overflow-hidden rounded-sm border ${
                    selectedImage === url ? 'border-primary ring-1 ring-primary' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img 
                    src={`http://localhost:8080${url}`} 
                    alt={`view ${index}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col h-full">
          <div className="border-b border-stone-200 pb-6 mb-6">
            <h2 className="text-sm text-secondary font-bold tracking-widest uppercase mb-2">
                {item.brand || 'MUNSIKSA ORIGINAL'}
            </h2>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 break-keep leading-tight">
                {item.itemNm}
            </h1>
            
            <div className="flex items-end gap-3">
              {item.isDiscount && (
                <span className="text-lg text-stone-400 line-through font-light">
                  {item.price.toLocaleString()}원
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
                {basePrice.toLocaleString()}원
              </span>
              {item.isDiscount && (
                <span className="text-lg text-red-600 font-medium">
                  {item.discountRate}% OFF
                </span>
              )}
              {item.isPayback && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 ml-1">
                  10% 적립
                </span>
              )}
            </div>
          </div>

          <div className="flex-grow space-y-6">
            <div className="prose prose-stone prose-sm text-stone-600">
                <p className="whitespace-pre-line leading-relaxed">{item.itemDetail}</p>
            </div>

            <div className="space-y-4 pt-4">
                {item.itemOptionList && item.itemOptionList.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">옵션 선택</label>
                        <select 
                            className="w-full border border-stone-300 rounded px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
                            value={selectedOption ? JSON.stringify(selectedOption) : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedOption(val ? JSON.parse(val) : null);
                            }}
                        >
                            <option value="">옵션을 선택해주세요</option>
                            {item.itemOptionList.map((opt, idx) => (
                                <option key={idx} value={JSON.stringify(opt)}>
                                    {opt.optionName} {opt.extraPrice > 0 ? `(+${opt.extraPrice.toLocaleString()}원)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">수량</label>
                    <div className="flex items-center border border-stone-300 rounded w-32">
                        <button 
                            onClick={() => handleQuantityChange(-1)}
                            className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition"
                        >
                            -
                        </button>
                        <input 
                            type="text" 
                            readOnly 
                            value={quantity} 
                            className="flex-1 text-center w-full text-gray-900 font-medium focus:outline-none"
                        />
                        <button 
                            onClick={() => handleQuantityChange(1)}
                            className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="bg-stone-50 p-4 rounded text-sm text-stone-600 space-y-1">
                    <div className="flex justify-between">
                        <span>배송비</span>
                        <span>{item.deliveryFee === 0 ? '무료배송' : `${item.deliveryFee.toLocaleString()}원`}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>원산지</span>
                        <span>{item.origin || '상세설명 참조'}</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-stone-700">총 상품 금액</span>
                <div className="text-right">
                    <span className="text-sm text-stone-500 mr-2">
                        총 수량 {quantity}개
                    </span>
                    <span className="text-3xl font-bold text-secondary-dark">
                        {totalPrice.toLocaleString()}
                        <span className="text-lg font-normal ml-1">원</span>
                    </span>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => handleOrder('cart')}
                    className="flex-1 py-4 px-4 border border-stone-300 rounded font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition"
                >
                    장바구니
                </button>
                <button 
                    onClick={() => handleOrder('buy')}
                    className="flex-1 py-4 px-4 bg-primary text-white rounded font-bold hover:bg-primary-dark transition shadow-md"
                >
                    구매하기
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}