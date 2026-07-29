import { CardTile } from '../../src/components/CardTile';

const ART = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
    <rect width="300" height="400" fill="#11151f"/>
    <rect x="10" y="10" width="280" height="380" fill="none" stroke="#4fd1c5" stroke-width="2"/>
    <text x="150" y="210" fill="#4fd1c5" font-family="monospace" font-size="16" text-anchor="middle">SPECIMEN</text>
  </svg>`,
)}`;

export function Owned() {
  return (
    <CardTile
      name="Vaporeon"
      setName="Jungle · 1st Edition"
      cardNumber="No. 012"
      imageUrl={ART}
      rarity="rare"
      quantity={2}
      isPulsing={false}
      onAdd={() => {}}
    />
  );
}

export function NoArt() {
  return (
    <CardTile
      name="Machop"
      setName="Base Set"
      cardNumber="No. 067"
      imageUrl={null}
      rarity="common"
      quantity={0}
      isPulsing={false}
      onAdd={() => {}}
    />
  );
}

export function Epic() {
  return (
    <CardTile
      name="Charizard ex"
      setName="Obsidian Flames"
      cardNumber="No. 125"
      imageUrl={ART}
      rarity="epic"
      quantity={1}
      isPulsing={false}
      onAdd={() => {}}
    />
  );
}

export function JustAdded() {
  return (
    <CardTile
      name="Snorlax"
      setName="Jungle"
      cardNumber="No. 011"
      imageUrl={ART}
      rarity="uncommon"
      quantity={1}
      isPulsing={true}
      onAdd={() => {}}
    />
  );
}
