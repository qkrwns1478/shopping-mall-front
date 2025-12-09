export interface OrderItem {
  itemNm: string;
  count: number;
  orderPrice: number;
  imgUrl: string;
  optionName: string;
}

export interface OrderHist {
  orderId: number;
  orderDate: string;
  orderStatus: 'ORDER' | 'CANCEL';
  totalAmount: number;
  orderItemDtoList: OrderItem[];
  memberEmail: string;
}