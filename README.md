# Gift AR — v0.3.0

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel van deze versie
v0.3.0 is de eerste browsergebaseerde objectherkennings-proof-of-concept.

Deze versie probeert nog NIET een object onder alle omstandigheden robuust te herkennen.
Het doel is veel specifieker:

> Kunnen we een object lokaal registreren, de registratie bewaren en datzelfde object daarna via de camera opnieuw onderscheiden van andere objecten?

## Nieuwe functionaliteit
- Drie referentie-aanzichten van één object registreren
- Alleen het centrale scanvlak van het camerabeeld analyseren
- Geen foto's opslaan: alleen compacte visuele descriptors
- Registratie lokaal bewaren in `localStorage`
- Live vergelijking met het geregistreerde object
- Overeenkomstscore in procenten
- Eerste vaste herkenningsdrempel van 86%
- `CADEAU HERKEND` bij voldoende overeenkomst
- Registratie volledig kunnen wissen
- Recognition-loop correct stoppen bij camera-stop, herstart, achtergrond of pagehide
- Geen externe dependencies

## Belangrijke beperking van deze PoC
De huidige herkenning gebruikt een lichte, zelfgebouwde visuele descriptor:
- genormaliseerd grijsbeeld voor structuur;
- kleurhistogram voor kleurinformatie;
- vergelijking met maximaal drie geregistreerde aanzichten.

Dit is bewust een eenvoudige technische proef. Het is nog geen definitieve object-recognition engine.

Voor deze test:
- laat het object het grootste deel van het witte kader vullen;
- gebruik liefst een object met duidelijke visuele kenmerken;
- een steen met opvallende strik/lint is een goede test;
- probeer tijdens registratie drie verschillende maar niet extreme hoeken.

## Privacy
De camera-analyse gebeurt lokaal in de browser.
v0.3.0 uploadt geen camerabeelden en slaat geen foto's op.
Alleen numerieke descriptors worden lokaal in `localStorage` opgeslagen.

## Bestaande functies die geraakt kunnen worden
Recognition gebruikt de camerastream van v0.2.0. Daarom zijn vooral deze bestaande functies opnieuw relevant:
- camera starten;
- camera stoppen;
- camera herstarten;
- cleanup bij achtergrond;
- cleanup bij pagehide.

Recognition moet stoppen zonder de Camera Core te beschadigen.

## Automatisch gecontroleerd vóór build
- dubbele HTML-ID's
- ontbrekende DOM-referenties
- ontbrekende JavaScript-imports
- modulebestanden aanwezig
- herkenningsknoppen hebben afzonderlijke eventlisteners
- geen externe dependencies toegevoegd

## Android/Chrome praktijktest

### A — Regressietest v0.2.0
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie `0.3.0`.
3. Controleer baseline `0.2.0`.
4. Voer `Basistest` uit.
5. Controleer dat deze slaagt.
6. Start en stop de camera minstens vijf keer.
7. Gebruik `Herstart camera` minstens drie keer.
8. Controleer opnieuw dat de camera na achtergrond/voorgrond normaal kan starten.

### B — Registratie
9. Start de camera.
10. Neem één duidelijk object, bij voorkeur de teststeen met opvallende strik.
11. Houd het object binnen het witte vierkante kader en laat het kader grotendeels vullen.
12. Tik `Registreer aanzicht`.
13. Draai het object ongeveer 20–40 graden.
14. Registreer aanzicht 2.
15. Draai opnieuw.
16. Registreer aanzicht 3.
17. Controleer `3 / 3`.

### C — Positieve herkenning
18. Tik `Start herkennen`.
19. Richt opnieuw op één van de geregistreerde aanzichten.
20. Beweeg iets dichter en verder.
21. Verander de hoek licht.
22. Noteer de overeenkomstscore.
23. Controleer of `CADEAU HERKEND` verschijnt wanneer de score 86% of hoger is.

### D — Negatieve herkenning
24. Richt op een compleet ander object.
25. Controleer of `CADEAU HERKEND` verdwijnt.
26. Test minstens drie verschillende verkeerde objecten.
27. Test indien mogelijk een andere steen zonder de strik.
28. Noteer eventuele valse herkenningen.

### E — Achtergrond en lifecycle
29. Laat herkenning actief.
30. Zet Chrome naar de achtergrond.
31. Open Chrome opnieuw.
32. Controleer dat camera en herkenning gestopt zijn.
33. Start de camera opnieuw.
34. Start herkenning opnieuw.
35. Controleer dat de opgeslagen registratie nog aanwezig is.

### F — Herladen
36. Herlaad de pagina.
37. Controleer dat de registratie nog aanwezig is.
38. Start camera en herkenning opnieuw.
39. Controleer of hetzelfde object opnieuw kan worden herkend.

### G — Registratie wissen
40. Tik `Wis registratie`.
41. Controleer dat `0 / 3` verschijnt.
42. Controleer dat herkenning niet kan starten zonder nieuwe registratie.

## Wat ik van de praktijktest nodig heb
Deze versie is onderzoeksgericht. Geef bij voorkeur door:
- hoogste score bij het juiste object;
- typische score bij het juiste object;
- hoogste score bij een verkeerd object;
- of een andere steen ten onrechte werd herkend;
- welke hoeken goed/slecht werkten;
- of lichtverandering veel invloed had.

Die resultaten bepalen of we:
1. deze eenvoudige methode verder verfijnen;
2. meerdere descriptors/features combineren;
3. of naar een krachtigere recognition-techniek gaan.

## Succescriterium
v0.3.0 hoeft nog geen productierijpe herkenning te leveren.
De PoC is geslaagd wanneer:
- registratie lokaal werkt;
- registratie na herladen bewaard blijft;
- hetzelfde object duidelijk hogere scores haalt dan verkeerde objecten;
- lifecycle van v0.2.0 intact blijft.

## Volgende fase
Pas na analyse van deze testresultaten bepalen we de precieze inhoud van v0.4.0.
