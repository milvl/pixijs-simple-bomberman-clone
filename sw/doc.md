# Semestrální práce z předmětu KIV/UUR - Jednoduchý klon hry Bomberman

> Autor: Milan Vlachovký

## 1. Úvod

Cílem tohoto projektu bylo vytvořit jednoduchý klon hry Bomberman s využitím webových technologií. Projekt je zaměřen na demonstraci základních principů fungovaní hry při zajištění pohodlného ovládání a zážitku pro uživatele. Projekt je koncipován jako školní semestrální práce, takže určité aspekty, které by v reálné produkci byly důležité, jsou zde zjednodušeny nebo vynechány (řádný WSGI server, ...).

### Architektura systému

Projekt je rozdělen na frontendovou část, která zahrnuje klientský kód napsaný v JavaScriptu s využitím knihovny [PIXI.js](https://pixijs.com/), a backendovou část, kterou tvoří webový server ([Nginx](https://nginx.org/en/)), dokumentová databáze [MongoDB](https://www.mongodb.com/) a Pythonovský script využívající knihovnu [Flask](https://flask.palletsprojects.com/en/3.0.x/) pro asynchronní (AJAX) zpracovávání POST a GET požadavků pro komunikaci s DB. Při připojení k serveru se na klient pošlou statické soubory (HTML, CSS, JS) a celá hra se odehrává na straně klienta. Backend slouží pouze pro ukládání skóre a získávání žebříčku nejlepších hráčů. Statické soubory posílané na klienta jsou dopředu zpracovány balíčkovacím nástrojem [Parcel](https://parceljs.org/). **Pro jednoduchost testování a spuštění projektu byl zřízen jednoduchý server na adrese: PLACEHOLDER kde je možné hru vyzkoušet bez nutnosti lokální instalace**.

### Požadavky

- Node.js/npm
- Python 3.10 a vyšší
- MongoDB
- Nginx

## 2. Návod na zprovoznění

Pro sestavení statických souborů stačí spustit `npm run build`, který za použití Parcelu vytvoří složku `dist` s výslednými soubory (případně `npm run build-dev`, který vytvoří soubory s mapováním pro ladění). Tyto soubory je potřeba servírovat pomocí webového serveru (např. zmiňovaný Nginx). Pro získávání a ukládání informací do DB přes AJAX volání je potřeba spustit Flask server (primitivní, nativní přes Python; nevhodný pro reálnou produkci, protože se nejedná o plnohodnotný WSGI server, ale pro účely této práce postačuje). Pro správnou funkčnost je potřeba mít spuštěný MongoDB server s defaultním nastavením pro porty. Pro spuštění Flask serveru je potřeba mít nainstalované závislosti z `requirements.txt` a spustit `db_init.py` pro inicializaci DB a následně `ajax_handler.py` pro spuštění Flask serveru. Tento script bude naslouchat na portu 5000 a bude zpracovávat požadavky z frontendu. 

### Instalace krok za krokem

Pro instalaci a nastavení projektu proveďte následující kroky:

1. Projekt mějte v lokálním adresáři s právy pro čtení, zápis a spuštění.
2. Nainstalujte `js` závislosti pomocí `npm install` z kořenové složky a Python závislosti pomocí `pip install -r requirements.txt` ve složce `backend`.
3. Sestaňte statické soubory pomocí `npm run build` nebo `npm run build-dev`. Soubory budou uloženy ve složce `dist`.
4. Spusťte MongoDB server na defaultním portu.
5. Spusťte Flask server pomocí `python ajax_handler.py` ve složce `backend`.
6. Spusťte webový server (např. Nginx) a nastavte cestu k statickým souborům na složku `dist`. Ujištěte se, že server zároveň pomocí reverse proxy posílá požadavky na Flask server (port 5000).
7. Otevřete webový prohlížeč a zadejte adresu serveru.

## 3. Struktura projektu

### Kořenová složka

- `audio`: Obsahuje zvukové soubory pro efekty a hudbu.
- `backend`: Skripty Flask aplikace a další backendové soubory.
- `css`: Styly pro frontend.
- `dist`: Výsledné soubory po sestavení.
- `fonts`: Fonty použité ve hře.
- `img`: Obrázky použité ve hře.
- `js`: JavaScriptovské soubory pro frontend.
- `node_modules`: NPM závislosti.
- `package.json`: Konfigurace pro NPM.
- `index.html`: Vstupní bod pro hru.

### Backend (složka `./backend/`)

- `db.json`: JSON soubor pro inicializaci databáze pro správný běh hry při prvním spuštění.
- `db_init.py`: Pythonovský skript pro inicializaci databáze.
- `ajax_handler.py`: Pythonovský skript pro zpracování AJAX požadavků s využitím Flask.
- `requirements.txt`: Závislosti pro Python.

### Frontend (složka `./js/`)

Soubory jsou řazeny podle jejich přednosti ve spouštění.

- `app.js`: Vstupní bod pro hru.
  - Zde dochází k inicializaci hry.
  - Dojde k vytvoření instance PIXI aplikace.
  - Dojde k napojení metod zajistujících škálování a přizpůsobení velikosti okna a pro ovládání klávesnicí.
  - Dojde k načtení všech potřebných assetů (obrázky, zvuky, ...).
  - Vznikne instance hry, kterou reprezentuje třída `Game` z modulu `game.js`.

- `game.js`: Modul obsahující třídu `Game`, která reprezentuje hru.

## 4. Moduly a třídy

### JavaScript/PIXI.js moduly

Každý modul je dokumentován zvlášť s vysvětlením jeho účelu a funkcí.

### Python/Flask moduly

Detailní popis backendových modulů a jejich funkcí.

## 5. API dokumentace

### Endpointy

Příklad:

- GET `/api/score`: Vrací skóre.
- POST `/api/save`: Uloží stav hry.

## 6. Testování

### Testovací strategie

Popis, jaké typy testů jsou implementovány.

### Spouštění testů

Příklad spouštění testů:

```bash
python -m unittest discover
