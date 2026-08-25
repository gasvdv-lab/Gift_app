# Gift AR — v0.5.1R

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE — gecorrigeerde complete modulaire build.

## Stabiele baseline
v0.2.0 Camera Core.

## Upgrade
v0.5.1R herstelt de volledige modulaire projectstructuur en bevat Multi-view Registration:
- 3 aanzichten minimum, 5 maximum;
- per aanzicht: eigen foto → handmatige selectie → crop → opslag;
- galerij;
- afzonderlijk verwijderen;
- afronden vanaf 3 aanzichten;
- LocalStorage persistentie.

## JS-architectuur
app.js, camera.js, registration.js, ui.js, capabilities.js, recognition.js, gift-state.js, xr-adapter.js, placement.js, experience.js, renderer.js, assets.js, ai-assistance.js.

Recognition, Project State, WebXR, Placement, Experience, Renderer, Assets en AI Assistance zijn bewust aanwezige maar nog inactieve modulegrenzen.

## Testvolgorde Android/Chrome
1. Open de vaste app-link en controleer v0.5.1R.
2. Basistest moet melden dat alle 12 modules geladen zijn.
3. Registreer aanzicht 1: foto → selectie → preview → opslag.
4. Herhaal voor aanzicht 2 en 3 vanuit andere posities.
5. Controleer galerij en thumbnails.
6. Rond registratie af vanaf 3 aanzichten.
7. Voeg desgewenst aanzicht 4 en 5 toe; zesde moet geblokkeerd zijn.
8. Verwijder één aanzicht; andere data moet intact blijven.
9. Herlaad de pagina; opgeslagen views moeten blijven.
10. Test terugknop en opnieuw starten van camera.
11. Test Chrome naar achtergrond tijdens camera; daarna moet opnieuw starten mogelijk blijven.

## Volgende fase
Na fysieke bevestiging: v0.6.0 AI Object Isolation / Segmentation.
