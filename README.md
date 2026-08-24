# Gift AR — v0.4.0

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Waarom v0.4.0
De globale beeldvergelijking uit v0.3.x bleek onvoldoende robuust.
Het correcte testobject zakte onder veranderde omstandigheden tot ongeveer 57–66%.

Daarom wordt de Recognition Engine in v0.4.0 fundamenteel vervangen in plaats van verder kleine patches toe te voegen.

## Nieuwe Recognition Engine 2
v0.4.0 gebruikt een feature-based prototype zonder externe dependencies.

Flow:
1. centraal scanvak capturen;
2. helderheid normaliseren;
3. lokale hoek-/kenmerkpunten zoeken;
4. voor elk kenmerk een compacte BRIEF-achtige descriptor maken;
5. live descriptors matchen met geregistreerde descriptors;
6. slechte matches verwijderen met een ratio-test;
7. geometrische consistentie controleren met een similarity-transform;
8. confidence bepalen uit het aantal geometrisch bevestigde matches.

## Diagnostiek
Tijdens registratie:
- aantal gevonden kenmerken;
- spreiding over het scanvak;
- herkenbaarheid: GOED / MATIG / MOEILIJK.

Tijdens herkenning:
- live kenmerken;
- goede matches;
- geometrisch bevestigde matches;
- confidence: GEEN / LAAG / MIDDEL / HOOG.

`CADEAU HERKEND` verschijnt alleen bij MIDDEL of HOOG.

## Belangrijk
Dit is nog steeds een onderzoeksprototype.
Feature matching werkt normaal beter bij objecten met:
- textuur;
- scherpe contrasten;
- unieke krassen/patronen;
- linten/strikken/stickers.

Een effen rode aansteker is bewust een moeilijk object.
Een steen met een duidelijk patroon en strik is voor dit project waarschijnlijk een veel betere test.

## Geen regressies bedoeld
De volgende onderdelen blijven conceptueel onveranderd:
- fullscreen camera-UI;
- geen scroll in camera-modus;
- terugknop;
- camera cleanup;
- LocalStorage;
- Recognition is afzonderlijke module;
- nog geen WebXR/AR;
- geen externe dependencies.

## Nieuwe opslag
v0.4.0 gebruikt een nieuwe LocalStorage-sleutel.
Registraties uit v0.3.x zijn niet compatibel en worden niet gebruikt.

## Praktijktest Android/Chrome

### A — regressie
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie 0.4.0 en baseline 0.2.0.
3. Voer Basistest uit.
4. Open en sluit de camera minstens vijf keer.
5. Zet Chrome tijdens cameragebruik naar de achtergrond.
6. Keer terug en controleer dat de camera opnieuw normaal kan starten.
7. Controleer dat fullscreen UI, terugknop en geen-scroll gedrag behouden zijn.

### B — registratie
8. Kies liefst een object met veel unieke details. Voor het echte Gift AR-concept: steen + strik.
9. Open Object registreren.
10. Laat het object zoveel mogelijk het witte kader vullen.
11. Registreer aanzicht 1.
12. Noteer Kenmerken, Spreiding en Herkenbaarheid.
13. Draai het object ongeveer 20–35 graden.
14. Registreer aanzicht 2.
15. Draai nogmaals en registreer aanzicht 3.

Als een aanzicht minder dan 18 bruikbare kenmerken bevat, wordt het niet opgeslagen.

### C — juiste herkenning
16. Open Object herkennen.
17. Start herkennen.
18. Richt op het juiste object.
19. Test verschillende kleine hoeken en afstanden.
20. Noteer Live kenmerken, Goede matches, Geometrisch bevestigd en Confidence.

### D — verkeerde objecten
21. Richt op de oorspronkelijke achtergrond zonder cadeau.
22. Richt op minstens drie compleet andere objecten.
23. Test indien mogelijk een vergelijkbaar object.
24. Noteer de hoogste aantallen Goede matches / Geometrisch bevestigd.
25. Noteer of er een valse `CADEAU HERKEND` melding is.

### E — robuustheid
26. Verplaats het cadeau naar een andere achtergrond.
27. Verander het licht.
28. Draai het cadeau 45–90 graden.
29. Ga dichter en verder.
30. Test opnieuw.

## Wat terugkoppelen
Voor het juiste object:
- gemiddeld aantal live kenmerken;
- goede matches;
- geometrisch bevestigde matches;
- confidence.

Voor het beste verkeerde object:
- goede matches;
- geometrisch bevestigde matches;
- confidence.

En vooral:
- wordt het juiste object onder andere achtergrond/licht nog herkend?
- ontstaat ergens een false positive?

## Succescriterium
v0.4.0 is interessant genoeg om verder te ontwikkelen als het juiste object herhaaldelijk duidelijk meer geometrisch consistente matches oplevert dan verkeerde objecten.

Als dit onvoldoende blijkt, stappen we daarna niet terug naar globale beeldscores, maar onderzoeken we AI/vision embeddings als extra herkenningslaag.

## Volgende kandidaat
Bij voldoende resultaat:
v0.4.1 — AI-assisted / hybrid recognition research.

Bij onvoldoende resultaat:
Recognition Engine 3 ontwerpen op basis van browsergeschikte vision embeddings of een hybride aanpak.
