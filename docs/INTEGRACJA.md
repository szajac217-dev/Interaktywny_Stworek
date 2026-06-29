# Integracja z digital signage

Ten dokument opisuje późniejsze podłączenie modułu do strony digital signage. Na obecnym etapie nie wprowadzamy żadnych zmian w repozytoriach ekranów ani repertuaru kina.

## 1. Dodanie bezpiecznej strefy

W stronie ekranu należy wskazać pusty obszar, w którym stworek może się poruszać:

```html
<div id="mascot-track" class="mascot-track" aria-hidden="true"></div>
```

Element powinien znajdować się między kodami QR lub w innym miejscu, które nie zawiera ważnych informacji.

## 2. Dołączenie modułu

```html
<link rel="stylesheet" href="ścieżka/mascot.css">
<script src="ścieżka/mascot.js"></script>
```

## 3. Uruchomienie stworka

```js
const mascot = new InteractiveMascot({
  host: '#mascot-track',
  image: 'ścieżka/do/stworka.svg',
  size: 94,
  startPosition: 0.08,
  edgePadding: 0
});
```

Warstwa ma `pointer-events: none`, dlatego nie przechwytuje kliknięć ani dotyku.

## 4. Reakcja po zmianie plakatu

W miejscu, w którym obecny system przełącza plakat, wystarczy dodać:

```js
notifyMascotPosterChange({
  category: 'koncert',
  title: 'Nazwa wydarzenia',
  src: 'plakaty-moksial/koncert.jpg'
});
```

Obsługiwane kategorie:

- `koncert`
- `wystawa`
- `rodzinne`
- `kino`
- `sport`
- `warsztaty`
- `teatr`

Jeżeli kategoria nie zostanie podana, moduł próbuje rozpoznać ją na podstawie tytułu.

## 5. Własna reakcja

Można wymusić konkretną animację i symbol:

```js
notifyMascotPosterChange({
  category: 'koncert',
  state: 'dance',
  bubble: '🤪'
});
```

Dostępne stany w prototypie:

- `idle`
- `walk`
- `look`
- `happy`
- `dance`
- `surprised`
- `think`
- `point`
- `lean`

## 6. Podmiana tymczasowej postaci

Najprostszy wariant to podmiana pliku:

```text
assets/mascot/placeholder.svg
```

Można także przekazać inną ścieżkę podczas tworzenia modułu:

```js
new InteractiveMascot({
  host: '#mascot-track',
  image: 'assets/mascot/docelowy-stworek.webp'
});
```

Docelowo lepszy efekt da zestaw osobnych klatek animacji. Mechanika ruchu i reakcje mogą pozostać bez zmian.

## 7. Zasady bezpieczeństwa interfejsu

- host stworka powinien obejmować wyłącznie pustą przestrzeń,
- rozmiar postaci należy dobrać tak, aby nie nachodziła na plakaty i kody QR,
- warstwa nie powinna mieć aktywnych przycisków,
- wszystkie elementy stworka powinny mieć `aria-hidden="true"`,
- przy ustawieniu systemowym ograniczenia ruchu animacje są wyłączane.
