export interface Card {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
  quantity: number;
  imageUrl: string | null;
  createdAtUtc: string;
}

export interface CreateCardInput {
  name: string;
  setName: string;
  cardNumber: string;
  imageUrl: string | null;
}

export interface UpdateCardInput {
  name: string;
  setName: string;
  cardNumber: string;
}

export interface CatalogSearchResult {
  externalId: string;
  name: string;
  setName: string;
  cardNumber: string;
  imageUrl: string | null;
  rarity: string | null;
  ownedQuantity: number;
}
