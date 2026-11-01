# Aether Lemric — strona produktu

Statyczna strona produktu: HTML, CSS i JavaScript, bez frameworka, formularzy i serwera aplikacyjnego. Gotowe pliki HTML można publikować na hostingu statycznym, również w podkatalogu. Treść jest dostępna bez JavaScriptu.

## Podgląd

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Otwórz http://127.0.0.1:4173. Strona główna jest po polsku. Polski i angielski mają pełną nową prezentację produktu oraz osobne strony:

- `pl/index.html`, `en/index.html` — zgłoszenia, workflow, czas, tablice, uprawnienia, własna instalacja i FAQ.
- `pl/features.html`, `en/features.html` — dwanaście obszarów funkcjonalnych z opisami i przykładami.
- `pl/about.html`, `en/about.html` — o Lemric i podejściu do rozwoju Aether.
- `pl/why.html`, `en/why.html` — scenariusze, w których warto rozważyć produkt.
- `pl/server.html`, `en/server.html` — wdrożenie Server i odpowiedzialność za utrzymanie.

Polskie strony mają również wejścia w katalogu głównym: `index.html`, `features.html`, `about.html`, `why.html`, `server.html`.

Pozostałe 22 strony główne zachowują wcześniejsze tłumaczenia i wcześniejszy układ. Ich odnośniki do podstron prowadzą do wersji angielskich i są oznaczone `(EN)` oraz `hreflang="en"`. Nowa prezentacja produktu i jej selektor języka obejmują polski i angielski. Strony główne zachowują wzajemne metadane `hreflang` dla 24 języków. Pełna aktualizacja pozostałych tłumaczeń pozostaje osobnym etapem.

Kontakt to odnośniki `mailto:support@lemric.com`, zgodnie z decyzją właściciela. Nie ma formularza, analityki ani wywołań API.

## Źródła i generowanie

- `locales/marketing.pl.json`, `locales/marketing.en.json` — całość treści nowej prezentacji i pięciu stron PL/EN.
- `tools/marketing.mjs` — dokumenty, nawigacja, ilustracje funkcji i galeria ekranów.
- `marketing.css`, `marketing.js` — wygląd i interakcje nowej prezentacji.
- `assets/screenshots/` — rzeczywiste ekrany demonstracyjnej instancji aplikacji, w dwóch motywach.
- `tools/build.mjs`, `tools/languages.mjs` — generowanie i wspólna lista języków.
- `tools/legacy.mjs`, `tools/product.mjs`, `locales/product.*.json`, wcześniejsze słowniki, `styles.css` i `script.js` — zachowana prezentacja pozostałych 22 języków.
- `theme.js` — wspólne wstępne ustawienie motywu.

Po zmianach uruchom Node.js 18+:

```sh
node tools/build.mjs
node tools/check.mjs
```

Na tej maszynie sprawna alternatywa dla uszkodzonej instalacji Homebrew Node to `/usr/local/bin/node`. Generator zapisuje 37 dokumentów HTML. Hasz treści CSS i skryptów w adresach zasobów odświeża pamięć podręczną po zmianach.

Na hosting prześlij wszystkie pliki HTML z katalogu głównego, katalogi języków, `assets/`, `styles.css`, `script.js`, `marketing.css`, `marketing.js` i `theme.js`. Generator i słowniki nie są wymagane do działania gotowej strony. To repozytorium nie zawiera konfiguracji publikacji ani wdrożenia do usługi Sites.

## DesignSystem i dostępność

`assets/vendor/index.css` importuje niezmienione arkusze [Lemric/DesignSystem](https://github.com/Lemric/DesignSystem). Pochodzenie i identyfikatory Git zapisano w `assets/vendor/provenance.json`. Kontrola sprawdza zgodność plików bajt po bajcie przez identyfikatory blobów Git. Kompozycja strony korzysta z tokenów DS; źródłowe pliki dostawcy pozostają bez zmian.

Nowy układ dopasowano do aktualnego lemric.com: kontener 1040 px, nagłówek 48 px, Onest, tytuł 40 px, zaokrąglone przyciski oraz ta sama paleta jasna i ciemna. Font Onest jest hostowany lokalnie, z systemowym fallbackiem i licencją SIL OFL w `assets/fonts/OFL.txt`. Zapis preferencji motywu jest opcjonalny: awaria localStorage nie blokuje strony.

Menu mobilne i FAQ działają natywnie przez `details`/`summary`. Sześć ilustracji funkcji wybiera się zakładkami z obsługą strzałek, Home i End na komputerze oraz natywnym selektorem na telefonie. Bez JavaScriptu ilustracje są widoczne jedna pod drugą, a odnośniki językowe dostępne w stopce.

## Zasady treści

Nowe opisy sprawdzono względem dokumentacji i implementacji sąsiedniego repozytorium AetherLemric: obszar roboczy, sprinty, konfiguracja tablic, schematy uprawnień, import i instalator. Własna instalacja oznacza kontrolę nad środowiskiem oraz obowiązki administratora; nie jest gwarancją bezpieczeństwa niezależną od konfiguracji i utrzymania.

Ilustracje funkcji są oznaczone jako przykładowe i pokazują uproszczony interfejs projektu sklepu internetowego. Osobna galeria zawiera nieedytowane zrzuty działającej aplikacji: tablicę projektu MOB i zgłoszenie MOB-15, z danymi demonstracyjnymi. Interfejs na zdjęciach jest polski także w wersji angielskiej strony, co opisuje podpis galerii. Nowa prezentacja nie zawiera Gantta ani widoku Development. Strona nie deklaruje liczby klientów, certyfikatów, SLA, publicznego instalatora ani dostępnej do zakupu usługi SaaS.

## Weryfikacja zmian

`tools/check.mjs` sprawdza 37 stron, kompletność słowników, dokładną zgodność wygenerowanych stron z treścią i szablonami, lokalne zasoby i odnośniki, identyfikatory, powiązania ARIA, metadane językowe, źródłowe pliki DS, składnię skryptów i używanie zmiennych CSS.

Podczas aktualizacji 1 listopada 2026 sprawdzono w przeglądarce:

- piętnaście nowych adresów PL/EN i głównych przy szerokościach 320, 390, 768 i 1280 px: 60 przypadków bez przepełnienia dokumentu;
- sześć ilustracji mobilnych, menu mobilne i FAQ;
- zakładki klawiaturą (strzałki, Home, End);
- motywy jasny/ciemny i zachowanie preferencji po zmianie języka;
- brak błędów konsoli w kontrolowanej sesji.

Prawa do DesignSystem pozostają zgodne z warunkami projektu źródłowego. Ta strona nie nadaje mu nowej licencji.
