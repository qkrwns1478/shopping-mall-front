// src/types/item.ts

export type ItemSellStatus = 'SELL' | 'SOLD_OUT';

/* 상품 등록/수정 폼 입력값 타입 */
export interface ItemFormInputs {
  itemNm: string;
  price: number;
  stockNumber: number;
  itemDetail: string;
  itemSellStatus: ItemSellStatus;
  imgUrlList: string[];
  category: string;
  options: string[];
  isDiscount: boolean;
  discountRate: number;
  brand: string;
  deliveryFee: number;
  origin: string;
}

/* 상품 리스트 조회용 타입 */
export interface Item {
  id: number;
  itemNm: string;
  price: number;
  stockNumber: number;
  itemSellStatus: ItemSellStatus;
  itemDetail?: string;
  imgUrlList: string[];
  regTime: string;
  updateTime?: string;
  category: string;
  rating: number;
  reviewCount: number;
  options: string[];
  isDiscount: boolean;
  discountRate: number;
  viewCount: number;
  salesCount: number;
  brand: string;
  deliveryFee: number;
  origin: string;
  isDeleted: boolean;
}