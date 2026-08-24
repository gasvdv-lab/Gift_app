# Gift AR — v0.3.1

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel
v0.3.1 corrigeert de mobiele UI-fout uit v0.3.0. Het herkenningsalgoritme is bewust niet gewijzigd.

## Gewijzigd
- Fullscreen camera tijdens registreren en herkennen
- Geen scroll in camera-modus
- Bedieningsknoppen als vaste overlay
- Registreren en herkennen als aparte modi
- Score en herkenningsstatus permanent zichtbaar
- Terugknop permanent zichtbaar
- Debug-informatie alleen op startscherm
- Camera en recognition worden bij verlaten correct gestopt

## Herkenning
Zelfde proof-of-concept als v0.3.0:
- maximaal 3 referentie-aanzichten
- lokale descriptors
- LocalStorage
- drempel 86%
- geen externe dependencies

## Testvolgorde Android
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie 0.3.1 en baseline 0.2.0.
3. Voer Basistest uit.
4. Open Object registreren.
5. Controleer dat de camera fullscreen opent en dat scrollen niet nodig is.
6. Controleer dat scanvak, teller, registreerknop en terugknop tegelijk zichtbaar zijn.
7. Registreer 3 aanzichten.
8. Ga terug.
9. Open Object herkennen.
10. Controleer dat camera, scanvak, score, drempel en knop tegelijk zichtbaar zijn.
11. Start herkennen en test juiste object, verkeerd object en indien mogelijk een andere steen.
12. Noteer hoogste/typische score voor juist object en hoogste score voor verkeerd object.
13. Zet Chrome tijdens camera/herkenning naar de achtergrond en keer terug.
14. Controleer dat de camera correct werd gestopt en opnieuw kan worden gestart.
15. Herlaad de pagina en controleer dat de 3 referenties bewaard zijn.

## Succescriteria
- Geen scroll in camera-modus.
- Camerabeeld blijft continu zichtbaar.
- Terug werkt betrouwbaar.
- v0.2.0 camera-lifecycle blijft intact.
- Registratie blijft na herladen bewaard.
- Herkenningsscores zijn praktisch testbaar.

## Volgende stap
Na jouw test beoordelen we eerst de recognition-resultaten. Pas daarna bepalen we v0.3.2 of v0.4.0.
