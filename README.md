# Aether Lemric — zapowiedź produktu

Statyczna strona produktu w 24 językach urzędowych Unii Europejskiej. HTML, CSS i JavaScript, bez frameworka, serwera aplikacyjnego i zależności do instalacji. Gotowe pliki HTML są zapisane w katalogach języków; wyświetlenie, indeksowanie i odczyt treści nie wymagają JavaScript.

## Podgląd i publikacja

Otwórz `index.html` lub uruchom w tym katalogu:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Adres podglądu: http://127.0.0.1:4173. Strona główna ma treść polską; każda wersja ma własny adres, np. `en/index.html`, `de/index.html`, `el/index.html`. Selektor języka w nagłówku prowadzi do rzeczywistego pliku. Awaryjne odnośniki w stopce są wyświetlane tylko przy wyłączonym JavaScript (`noscript`); nie ma drugiego rozwijanego spisu języków.

Na hosting statyczny prześlij `index.html`, `styles.css`, `script.js`, `theme.js`, cały katalog `assets/` oraz wszystkie 24 katalogi języków. Ścieżki względne obsługują publikację w podkatalogu. Przeglądarka nie pobiera tłumaczeń z zewnętrznych usług.

## DesignSystem jako źródło

`assets/vendor/index.css` importuje komplet 10 niezmienionych arkuszy z [Lemric/DesignSystem](https://github.com/Lemric/DesignSystem). Pochodzenie i identyfikatory Git poszczególnych plików zapisano w `assets/vendor/provenance.json`. Kontrola projektu sprawdza ich zgodność bajt po bajcie przez identyfikatory blobów Git.

- Przełącznik motywu jest źródłowym wzorcem `ThemeSwitcher`: `.ds-theme-switcher`, grupa trzech przycisków ze spanem, `aria-pressed` i `data-theme-choice`. Nie ma nadpisanych wymiarów ani wyglądu; kontrakt opisuje `examples/vanilla.html` i `src/components/appearance.tsx` w repozytorium DS.
- Wybór języka używa źródłowego wariantu `.ds-native-select--locale`. Nazwy języków są podane w ich własnej pisowni, bez utożsamiania języka z flagą państwa.
- Szerokość treści pochodzi z `.ds-container` i `--ds-measure-page` (1040 px). Skład opiera się na `.ds-stack`, `.ds-grid`, `.ds-card`; tablica, kroki i tabela korzystają z `.ds-kanban-*`, `.ds-stepper`, `.ds-table` oraz `.ds-tab-*`.
- Własny `styles.css` opisuje wyłącznie kompozycję strony i lokalne fonty. Odstępy, rozmiary tekstu, promienie, szerokości i fokus odwołują się do tokenów DS. Typografia nagłówków odwzorowuje skalę komponentu `Heading`. Nie ma pomniejszonej makiety aplikacji ani własnej skali odstępów.
- Ustawienia `data-brand="lemric"` oraz `data-theme="light|dark|auto"` korzystają z kontraktu DS. Wybór motywu jest zapisywany lokalnie i zachowany przy zmianie języka. Awaria pamięci lokalnej nie blokuje strony.
- Font Onest Variable jest hostowany lokalnie: latin, latin-ext i cyrillic. Dla znaków nieobsługiwanych przez Onest obowiązuje systemowy fallback z oryginalnego tokenu DS. Licencja SIL OFL znajduje się w `assets/fonts/OFL.txt`. Źródło: Fontsource CDN i [Google Fonts / Onest](https://github.com/google/fonts/tree/main/ofl/onest).

## Treść i tłumaczenia

Źródła tekstów znajdują się w `locales/*.json`. Każdy słownik zawiera kompletną treść: nawigację, opisy produktu, podglądy tablicy, workflow i czasu pracy, etykiety dostępności, motywy, metadane i stopkę. Nie ma zastępowania brakujących tekstów językiem polskim ani angielskim. Generator odrzuca brakujące lub puste wpisy.

Języki: bułgarski (`bg`), czeski (`cs`), duński (`da`), niemiecki (`de`), grecki (`el`), angielski (`en`), hiszpański (`es`), estoński (`et`), fiński (`fi`), francuski (`fr`), irlandzki (`ga`), chorwacki (`hr`), węgierski (`hu`), włoski (`it`), litewski (`lt`), łotewski (`lv`), maltański (`mt`), niderlandzki (`nl`), polski (`pl`), portugalski (`pt`), rumuński (`ro`), słowacki (`sk`), słoweński (`sl`) i szwedzki (`sv`). Zakres według [listy Komisji Europejskiej](https://traineeships.ec.europa.eu/frequently-asked-questions/which-are-official-languages-european-union_en).

Język dokumentu, tytuł, opis, metadane Open Graph oraz odnośniki `hreflang` są zapisane osobno dla każdej wersji. Przykładowe godziny są formatowane przez `Intl.NumberFormat` dla danego języka podczas generowania HTML. Nazwy produktu, identyfikatory zgłoszeń i inicjały pozostają stałe.

Treść przedstawia planowany zakres produktu zgodnie z dokumentacją E0 sąsiedniego projektu AetherLemric. Podglądy zawierają dane demonstracyjne. Nie zadeklarowano daty premiery. Nie ma formularza zapisów, analityki, cookies ani wywołań API.

## Aktualizacja i kontrola

Po zmianie słowników lub szablonu (Node.js 18+):

```sh
node tools/build.mjs
node tools/check.mjs
```

Generator nie jest wymagany do uruchomienia ani publikacji gotowej strony. `tools/check.mjs` sprawdza 25 stron HTML, kompletność 24 słowników, aktualność treści, lokalne zasoby i odnośniki, identyfikatory, powiązania ARIA, alternatywne wersje językowe, niezmienione pliki DS, składnię skryptów i korzystanie z tokenów rozmiarów.

Prezentacja obejmuje osiem podglądów: tablice Agile i Kanban, dashboard, komponenty, wydania, Development, Gantt, workflow i czas pracy. Zakres wykracza poza pierwszy pilot z dokumentacji E0: dodatkowe obszary przedstawiają planowane funkcje i kierunki rozwoju wskazane przez właściciela produktu. Dane w podglądach są przykładowe; nie są statystykami działającej usługi, integracjami z rzeczywistym repozytorium ani terminami premiery.

Układ został opracowany po bezpośrednim porównaniu z [lemric.com](https://lemric.com/pl): zwarty nagłówek, dwukolumnowe otwarcie z podglądem produktu, widoczny przegląd funkcji, sekcje opisujące sposób pracy i przełącznik motywu w stopce. Kontrolki, tekst, kolory, szerokości i odstępy korzystają z DS. Na telefonie podglądy wybiera się natywnym selektorem, a na komputerze zakładkami pionowymi (strzałki góra/dół, Home/End). Mobilne menu działa natywnie przez `details`/`summary`, zamyka się po wyborze odnośnika i obsługuje Escape.

Treść bez JavaScript pozostaje dostępna; wszystkie osiem podglądów jest wtedy wyświetlanych jeden pod drugim, a wybór języka jest dostępny w stopce. Kontrola automatyczna wymaga obecności wszystkich ośmiu widoków i ich opcji nawigacji w każdej wersji językowej.

Kontrola przeglądarkowa: osiem widoków × 24 języki przy szerokości 320 px bez przepełnienia strony; nagłówek mobilny we wszystkich językach, obsługa menu oraz klawiatury w pionowych zakładkach; widoki jasny i ciemny. Tabele z większą liczbą kolumn przewijają się we własnym regionie, zgodnie z DS.

Prawa do DesignSystem pozostają zgodne z warunkami projektu źródłowego. Ta strona nie nadaje mu nowej licencji.
