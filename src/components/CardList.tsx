import type { Card } from '../types/card';
import { formatDate } from '../utils/formatDate';

interface CardListProps {
  cards: Card[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function CardList({ cards, onDelete, isDeleting }: CardListProps) {
  if (cards.length === 0) {
    return <p className="empty-state">No cards yet. Add one below.</p>;
  }

  return (
    <table className="card-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Set</th>
          <th>Number</th>
          <th>Added</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {cards.map((card) => (
          <tr key={card.id}>
            <td>{card.name}</td>
            <td>{card.setName}</td>
            <td>{card.cardNumber}</td>
            <td>{formatDate(card.createdAtUtc)}</td>
            <td>
              <button type="button" onClick={() => onDelete(card.id)} disabled={isDeleting}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
