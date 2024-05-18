# UUR cv04

`12. 03. 2024`
---

Smysl: Zalozeni React projektu ve Webstormu
- Webstorm: New Project -> React -> tlacitko `npm start`
- Prekopirovat `src` dovnitr
- Vetsina Reactu se pise v .js jako funkce.
- Vstupni bod je `index.js`. Zde se nachazi obaleni zbytku stranky jeho restriktama a pote se "povola" (rozvine automaticky) HTML uzel `<App/>` (App.js)
- App.js muze slouzit jako hlavni soubor kde se bude definuje vzhled cele stranky.
- Styly se daji delat pres .css soubory, ktere do .js souboru importujes (napr. `import './App.css';`)
- Vzdy chces aby kazda fce vracela jeden uzel (jestli ma poduzly nevadi, ale fce musi vracet pouze jeden HTML uzel)

---
Nyni ChatGPT doplneni:

1. Vytvoreni noveho projektu: Vybrat "New Project", pote React. To automaticky nastavi potrebne konfigurace pro React aplikaci. Pri vytvareni projektu WebStorm zaroven nabidne moznost inicializace Git repozitare pro spravu verzi vaseho kodu.

2. npm start: Toto je spravne prvni krok po vytvoreni projektu. Spusti vyvojovy server a otevre aplikaci ve webovem prohlizeci. Presne umisteni tlacitka npm start zavisi na vasem vyvojovem prostredi a konfiguraci, ale obvykle jej najdete v horni/dolni casti WebStormu v sekci "npm".

3. Prekopirovani src: Pokud mate jiz predpripravenou strukturu projektu nebo komponenty, ktere chcete pouzit, je prekopirovani slozky src do vaseho noveho projektu dobrym krokem. Zkontrolujte ale, ze vsechny zavislosti jsou spravne definovany v package.json.

4. Psani kodu v Reactu: Ve WebStormu, stejne jako v jinych IDE, se React kod obvykle pise v souborech .js nebo .jsx. .jsx nabizi lepsi podporu pro JSX syntax, coz je rozsireni syntaxe JavaScriptu pro psani HTML prvku v JavaScriptu.

5. Vstupni bod aplikace: index.js je typicky vstupnim bodem React aplikace. Importuje se zde React, ReactDOM a hlavni komponenta (nejcasteji App.js). Pote se pouziva ReactDOM.render(), aby se hlavni komponenta vykreslila do urciteho HTML elementu v index.html (nejcasteji element s id root).

6. Hlavni komponenta App.js: Slouzi jako korenova komponenta pro vasi aplikaci, z ktere se budou "vetvit" dalsi komponenty. Je dobre zde definovat hlavni strukturu stranky nebo aplikace.

7. Import stylu: Import .css souboru do komponent je bezna praxe pro aplikovani stylu. WebStorm umoznuje snadne importovani stylu pomoci prikazu import `./App.css`;.

8. Jednotlive komponenty a vraceni elementu: Kazda funkce nebo trida komponenty by mela vracet jeden korenovy element. Pokud potrebujete vratit vice elementu, muzete je obalit do jednoho korenoveho elementu jako je `<div>`, nebo pouzit fragmenty `<>...</>`.

9. Pouziti ES6 a JSX: Pro moderni React vyvoj se doporucuje pouzivat ES6 (napr. sipkove funkce, tridy) a JSX pro lepsi citelnost a efektivitu kodu.

10. Stav a zivotni cyklus komponent: Uceni se o stavech (state) a zivotnim cyklu komponent je klicove pro spravu dat a chovani v React aplikacich.

Zvazte take naucit se pouzivat React Hooks, ktere nabizeji efektivnejsi zpusob prace se stavy a zivotnimi cykly komponent bez nutnosti psat tridy. React Hooks jako useState, useEffect a dalsi, poskytuji jednodussi a cistsi zpusob prace s reaktivnimi funkcemi v komponentach.