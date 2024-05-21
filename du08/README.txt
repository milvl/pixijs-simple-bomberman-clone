Omlouvam se, nestihl jsem do odevzdani dodelat veskerou funkcionalitu, pokusim se ji dodat co nejdrive do opravneho
terminu (na cw 26.5.2024 23:59). Dekuji za pochopeni.

Milan Vlachovsky (A21B0318P)

Update 22. 5. 2024
Aplikace je nyni funkcni. Vsechna funkcionalita se nachazi ve FileSystemNavigator.js.
Designove volby:
  - Nove uzly (slozka/soubor) se pokousi vlozit do oznaceneho uzlu, pokud je to slozka.
    Pokud je to soubor, vlozi se do rodice.
  - Pokud neni vybran zadny uzel (nebo je vybran soubor v rootu), vlozi se novy uzel do rootu.
  - Pri nevyplneni nazvu slozky/souboru se vytvori slozka/soubor s nazvem "NewFolder/NewFile.unknown"
  - Soubor, slozka (rozbalena), slozka (zabalena) a prazdna slozka maji vlastni ikony.
    - Tato funkcionalita je zarizena pomoci komponenty CustomTreeItem, ktera je zahrnuta do RichTreeView pod slots.item
      (jeji kod se vykonava pri kazdem narazeni na uzel pri renderovani stromu).
  - Pri vytvoreni nove slozky/souboru ci pokusu o prejmenovani se zobrazi dialogove okno s moznosti zadani nazvu.
    - Autor chtel puvodne tuto moznost nechat jako textfield input primo v samotnych uzlech, ale nakonec se,
      kvuli dostupnemu casu, rozhodl pro dialogove okno.
  - Vyber se da zrusit kliknutim na ikonu v toolbaru.
  - Kazda ikona v toolbaru ma tooltip s popisem.
  - Vypis obsahu souboru je zarizen TextFieldem, ktery je ma nastaveny disabled, aby nebylo mozne menit obsah souboru.
    - Barva textu je nastavena na cernou v CSS.
  - Pri kliknuti na soubor se zobrazi jeho obsah v TextFieldu.
    - Pokud je vybrana slozka, zustane puvodni vybrana volba.
    - Pokud je vybran root, zobrazi se zprava "No file selected".
    - Pri kliknuti na nepodporovany typ souboru se zobrazi zprava upozornujici na tuto skutecnost.
  - Obsah souboru nejde editovat, ale je mozne ho zkopirovat.

Struktura kodu:
  - Komponenta FileSystemNavigator obsahuje veskerou funkcionalitu.
  - Pro uchovani dat je pouzit useState s promennou fileSystem a fileSystemMap (pro rychly lookup uzlu).
  - Dalsi useState promenne jsou pro dynamicke zmeny stavu (vybrany uzel, obsah souboru, zobrazeni dialogu, ...)
  - Kod obashuje dva useEffecty:
    - Jeden useEffect slouzi k serazeni stromu po jeho zmenach.
    - Druhy useEffect slouzi k debugovani.
  - Handlery:
    - handleSelectedFileContent - zpracovava zobrazovani obsahu vybraneho souboru
    - handleNodeSelect - zpracovava vyber uzlu ve stromu
    - handleDelete - zpracovava smazani vybraneho uzlu
    - handleAdd - zpracovava pridani noveho souboru/slozky
    - handleRename - zpracovava prejmenovani vybraneho souboru/slozky
    - handleRenameDialogCancel - zpracovava zruseni dialogoveho okna pro prejmenovani
  - sortNodesFn - porovnavaci funkce pro serazeni uzlu
  - sortNode - pokusi se seradit uzly pod vybranym uzlem
  - sortFileSystem - seradi cely strom
  - CustomTreeItem - komponenta pro zobrazeni spravnych ikon u uzlu

Vracena komponenta obsahuje:
  - Toolbar s ikonami pro pridani nove slozky/souboru, smazani, prejmenovani a zruseni vyberu
  - RichTreeView s vlastnimi ikonami pro soubor, slozku (rozbalenou), slozku (zabalenou) a prazdnou slozku
  - TextField pro zobrazeni obsahu souboru
  - Dialogove okno pro potvrzeni smazani
  - Dialogove okno pro zadani noveho nazvu

Milan Vlachovsky (A21B0318P)