export interface Card {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
  quantity: number;
  createdAtUtc: string;
}

export interface CreateCardInput {
  name: string;
  setName: string;
  cardNumber: string;
}

export interface UpdateCardInput {
  name: string;
  setName: string;
  cardNumber: string;
}
