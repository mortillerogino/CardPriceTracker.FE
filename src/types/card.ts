export interface Card {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
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
