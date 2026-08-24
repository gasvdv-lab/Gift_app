# Gift AR — v0.1.0

## Doel van deze versie
Dit is uitsluitend het technische projectfundament. Er is bewust nog geen camera, objectherkenning of AR-functionaliteit.

## Architectuur
De volgende onderdelen zijn conceptueel en in de broncode gescheiden:
- Gift / Project State
- Camera / Input
- Recognition Engine
- XR Adapter
- Environment / Placement
- Experience Engine
- Renderer
- Asset Manager
- Capability Detection
- UI

## Wat v0.1.0 doet
- Mobiele startpagina
- ES-module structuur
- DOM-validatie bij opstarten
- Eenvoudige self-test
- Detectie van secure context, WebXR API en MediaDevices
- Touchvriendelijke basis-UI
- Geen externe dependencies

## Wat bewust NIET aanwezig is
- Cameratoegang
- Objectregistratie
- Objectherkenning
- WebXR-sessie
- AR-rendering
- Opslag/backend

## GitHub Pages
Upload de INHOUD van deze map naar de root van je GitHub Pages-repository.
De site moet via HTTPS geopend worden.

## Testvolgorde Android/Chrome
1. Open de GitHub Pages-link in Chrome.
2. Controleer dat `Gift AR v0.1.0 is correct gestart.` verschijnt.
3. Open `Versie-informatie` en controleer dat versie `0.1.0` staat.
4. Controleer dat `7 modules geladen` wordt weergegeven.
5. Tik op `Voer basistest uit`.
6. Controleer dat `Basistest geslaagd` verschijnt.
7. Op GitHub Pages moet `HTTPS/secure context: ja` verschijnen.
8. Sluit het tabblad volledig.
9. Open de link opnieuw en herhaal stap 2 t/m 6.
10. Herlaad de pagina meerdere keren.
11. Zet Chrome kort op de achtergrond, keer terug en voer de test opnieuw uit.
12. Draai het toestel indien toegestaan en controleer dat de UI bruikbaar blijft.

## Stabiliteitsstatus
CANDIDATE — wordt pas STABLE nadat de praktijktest op het doeltoestel bevestigd is.

## Volgende fase
Na bevestiging van v0.1.0: betrouwbare camera-core.
