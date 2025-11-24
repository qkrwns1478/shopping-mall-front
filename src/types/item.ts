export type ItemSellStatus = 'SELL' | 'SOLD_OUT';

/* 상품 등록/수정 폼 입력값 타입 */
export interface ItemFormInputs {
  itemNm: string;
  price: number;
  stockNumber: number;
  itemDetail: string;
  itemSellStatus: ItemSellStatus;
}

/* 상품 리스트 조회용 타입 */
export interface Item {
  id: number;
  itemNm: string;
  price: number;
  stockNumber: number;
  itemSellStatus: ItemSellStatus;
  itemDetail?: string;
  regTime: string;
  updateTime?: string;
}