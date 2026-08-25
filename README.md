# Gift AR — v0.5.1

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel
v0.5.1 breidt Registration Core 2.0 uit naar Multi-view Registration.

## Nieuw
- Minimum 3 en maximum 5 aanzichten
- Elk aanzicht heeft een eigen foto en handmatige selectie
- Galerij met thumbnails
- Elk aanzicht afzonderlijk verwijderen
- Automatische hernummering
- Na 3 aanzichten mag registratie afgerond worden
- Aanzicht 4 en 5 zijn optioneel
- Data blijft in LocalStorage bewaard

## Bewust nog niet
- AI-segmentatie
- automatische kwaliteitscontrole
- dynamic view coverage
- AI embeddings
- hybrid recognition
- WebXR/AR

## Testvolgorde Android/Chrome
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie 0.5.1.
3. Voer Basistest uit.
4. Registreer aanzicht 1 met foto → selectie → preview → opslaan.
5. Kies Volgend aanzicht en draai het cadeau.
6. Registreer aanzicht 2.
7. Registreer aanzicht 3.
8. Controleer dat afronden nu mogelijk is.
9. Bekijk de galerij en controleer drie verschillende crops.
10. Voeg aanzicht 4 en 5 toe.
11. Controleer dat geen zesde aanzicht kan worden toegevoegd.
12. Verwijder één aanzicht en controleer hernummering.
13. Voeg opnieuw een aanzicht toe.
14. Herlaad de pagina en controleer dat alle data behouden is.
15. Test camera terug/achtergrond/voorgrond opnieuw.
16. Rond de registratie af en herlaad opnieuw.

## Succescriteria
- 3 tot 5 onafhankelijke aanzichten werken
- iedere crop is correct
- verwijderen beschadigt andere views niet
- hernummering klopt
- opslag overleeft reload
- camera lifecycle blijft intact

## Volgende fase
v0.6.0 — AI Object Isolation / Segmentation.
