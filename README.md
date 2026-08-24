# Gift AR — v0.2.0

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.1.0 — bevestigd werkend op Android/Chrome.

## Doel van deze versie
v0.2.0 voegt uitsluitend een betrouwbare Camera Core toe bovenop de stabiele v0.1.0-basis.

## Nieuwe functionaliteit
- Achtercamera aanvragen via `getUserMedia`
- Camera starten, stoppen en herstarten
- Camerastream correct vrijgeven door alle tracks te stoppen
- Videoreferentie opruimen bij stoppen
- Camera automatisch stoppen wanneer de pagina naar de achtergrond gaat
- Cleanup bij `pagehide`
- Statusfeedback voor cameratoestemming en fouten
- Detectie van `getUserMedia`
- Touchvriendelijke camerabediening

## Bestaande functies die geraakt kunnen worden
De app-opstart, UI, DOM-referenties, capability detection en eventlisteners zijn uitgebreid. Recognition, XR, Placement, Experience, Renderer en Assets blijven passief.

## Bewust NIET aanwezig
- Objectregistratie of objectherkenning
- WebXR-sessie of hit-testing
- AR-rendering
- Gift-links
- Backend/opslag

## Android/Chrome praktijktest
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer dat `Gift AR v0.2.0 is correct gestart.` verschijnt.
3. Open Versie-informatie en controleer versie `0.2.0`, baseline `0.1.0` en `7 modules geladen`.
4. Tik op `Voer basistest uit` en controleer: basistest geslaagd, secure context = ja, MediaDevices = ja, getUserMedia = ja.
5. Tik `Start camera`, geef toestemming en controleer dat de achtercamera zichtbaar wordt.
6. Tik `Stop camera` en controleer dat het beeld verdwijnt.
7. Herhaal start/stop minstens 5 keer.
8. Start de camera en tik `Herstart camera`; herhaal dit 3 keer.
9. Start de camera, zet Chrome naar de achtergrond, keer terug en controleer dat de camera gestopt is.
10. Start daarna opnieuw de camera; die moet normaal openen.
11. Sluit het tabblad volledig, open de vaste link opnieuw en start de camera opnieuw.
12. Start de camera, herlaad de pagina en controleer daarna opnieuw de camerastart.

## Succescriteria
v0.2.0 mag alleen STABLE worden wanneer de achtercamera correct opent, start/stop 5 keer werkt, herstart werkt, achtergrond/voorgrond geen vastloper veroorzaakt, herladen en opnieuw openen werken en de v0.1.0-basistest blijft slagen.

## Volgende fase
Na bevestiging van v0.2.0: v0.3.0 — eerste browsergebaseerde objectherkennings-proof-of-concept.
