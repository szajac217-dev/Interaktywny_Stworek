# Interaktywny Stworek

Niezależny moduł animowanego stworka reagującego na zmianę plakatów w systemie digital signage MOKSiAL.

## Założenia projektu

- projekt działa w osobnym repozytorium,
- nie zmienia istniejących ekranów ani repertuaru kina,
- stworek jest nakładką z `pointer-events: none`, więc nie blokuje kliknięć i nie zasłania interfejsu,
- porusza się tylko we wskazanym, bezpiecznym obszarze,
- reakcję można wywołać po zmianie plakatu,
- docelową grafikę można podmienić bez przebudowy mechaniki.

## Co zawiera pierwszy prototyp

- demonstracyjny ekran pionowy 9:16,
- bezpieczną strefę między dwoma kodami QR,
- tymczasową postać SVG z przezroczystym tłem,
- ruch poklatkowy realizowany przez CSS,
- reakcje: koncert, wystawa, wydarzenie rodzinne, kino, sport, warsztaty i teatr,
- publiczny interfejs JavaScript do powiadamiania stworka o zmianie plakatu.

## Uruchomienie

Projekt jest statyczny. Wystarczy otworzyć `index.html` w przeglądarce albo uruchomić prosty serwer lokalny, np.:

```bash
python -m http.server 8080
```

Następnie wejść na `http://localhost:8080`.

## Najważniejsze pliki

```text
Interaktywny_Stworek/
├── index.html
├── demo.css
├── demo.js
├── src/
│   ├── mascot.css
│   └── mascot.js
├── assets/
│   └── mascot/
│       └── placeholder.svg
└── docs/
    └── INTEGRACJA.md
```

## Wywołanie reakcji

Po załadowaniu `src/mascot.js` można wysłać informację o nowym plakacie:

```js
notifyMascotPosterChange({
  category: 'koncert',
  title: 'Koncert na żywo'
});
```

Można też wysłać zdarzenie bezpośrednio:

```js
window.dispatchEvent(new CustomEvent('signage:poster-change', {
  detail: {
    category: 'wystawa',
    title: 'Wystawa malarstwa'
  }
}));
```

## Status

To jest pierwszy prototyp techniczny. Postać ma obecnie charakter zastępczy. Kolejny etap to przygotowanie docelowego wyglądu i prawdziwych klatek animacji PNG, WebP lub SVG.
