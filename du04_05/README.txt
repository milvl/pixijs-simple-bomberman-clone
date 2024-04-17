Omlouvám se, že jsem minule zapomněl na část úlohy s historií. Přehlédl jsem to v zadání. Tady je opravená verze.


Hodnoty hlavního barevného okénka se aktualizují kdykoliv při změně
ve sliderech a textových input polí či stisknutí tlačítek +/-. Jelikož se většinou jedná o malé změny,
tak bylo ukládání barev řešeno uživatelskou interakcí (kliknutím na dedikované tlačítko). Uživatel si tak
může uložit barvu, až když je s ní spokojen, do historie a následně ji zpětně načíst. Z hlediska UX mi to
přišlo jako lepší řešení, než ukládat barvy automaticky při každé změně.

Update:
Opět se omlouvám, že jsem zapomněl na část úlohy. Vůbec jsem to nepostřehl. Aktualizace sliderů a textových inputů na
základě vybrané barvy z historie byla implementována pomocí funkce `useEffect`. Při změně vybrané barvy se tedy
aktualizují všechny inputy a slidery.

Vlachovský (A21B0318P)