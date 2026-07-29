import { useState } from 'react';
import { CardForm } from '../components/CardForm';
import { CardList } from '../components/CardList';
import { useCards, useCreateCard, useDeleteCard } from '../hooks/useCards';

export function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: cards, isLoading, isError } = useCards(searchTerm);
  const createCard = useCreateCard();
  const deleteCard = useDeleteCard();

  return (
    <div className="cards-page">
      <input
        className="search-input"
        placeholder="Search cards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading && <p>Loading cards...</p>}
      {isError && <p className="error">Failed to load cards. Is the API running?</p>}
      {cards && <CardList cards={cards} onDelete={(id) => deleteCard.mutate(id)} isDeleting={deleteCard.isPending} />}

      <h2>Add a card</h2>
      <CardForm onSubmit={(input) => createCard.mutate(input)} isSubmitting={createCard.isPending} />
      {createCard.isError && <p className="error">Failed to add card. Check the fields and try again.</p>}
    </div>
  );
}
