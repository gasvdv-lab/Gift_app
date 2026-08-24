# Gift AR — v0.4.1

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel
v0.4.1 corrigeert de uitlijning tussen het zichtbare witte scanvak en het videobeeld dat Recognition werkelijk analyseert.

## Aanleiding
In v0.4.0 leek een object visueel niet gecentreerd te staan zonder de telefoon merkbaar zijwaarts te verplaatsen.

Een deel daarvan kan fysieke camera-parallax zijn, maar technisch was er ook een risico:
- de camera werd weergegeven met `object-fit: cover`;
- Recognition analyseerde een vaste centrale crop van het ruwe videoframe;
- die twee gebieden hoefden niet exact overeen te komen.

## Oplossing
Recognition berekent nu expliciet:
1. afmetingen van het ruwe cameraframe;
2. de `object-fit: cover` schaal;
3. de gecropte/verborgen videoranden;
4. de positie van het witte scanvak op het scherm;
5. de exacte corresponderende pixels in het ruwe cameraframe.

Daardoor analyseert Recognition nu hetzelfde gebied dat de gebruiker in het witte kader ziet.

## Nieuwe debugfunctie
In registratie- en herkenningsmodus is er een knop:

`Toon analysebeeld`

Daarmee verschijnt een kleine preview van exact het videobeeld dat Recognition analyseert.

Gebruik dit om visueel te controleren:
- object in wit kader;
- object in analyse-preview;
- beide moeten dezelfde uitsnede tonen.

## Recognition Engine
De feature-based engine uit v0.4.0 blijft verder gelijk:
- lokale featurepunten;
- BRIEF-achtige descriptors;
- descriptor matching;
- ratio filter;
- geometrische verificatie;
- confidence GEEN / LAAG / MIDDEL / HOOG.

## Opslag
v0.4.1 gebruikt een nieuwe registratieopslag.
Registreer het testobject opnieuw.

## Praktijktest

### A — regressie
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie 0.4.1.
3. Voer Basistest uit.
4. Open/sluit camera enkele keren.
5. Controleer fullscreen interface en terugknop.

### B — scan-uitlijning
6. Open Object registreren.
7. Plaats een duidelijk object exact in het midden van het witte kader.
8. Tik `Toon analysebeeld`.
9. Controleer het kleine analysebeeld.
10. Het object moet daar op dezelfde manier gecentreerd staan als in het witte kader.
11. Beweeg het object naar de linker rand van het witte kader.
12. Controleer dat het ook links in de analyse-preview verschijnt.
13. Herhaal rechts, boven en onder.

Als dit niet overeenkomt, stuur een screenshot met zowel wit kader als analyse-preview.

### C — registratie
14. Wis oude registratie indien nodig.
15. Registreer drie aanzichten.
16. Noteer Kenmerken, Spreiding en Herkenbaarheid.

### D — herkenning
17. Open Object herkennen.
18. Zet eventueel analyse-preview aan.
19. Start herkennen.
20. Controleer of herkenning nu exact hetzelfde gebied gebruikt als het witte kader.
21. Test juiste en verkeerde objecten.

## Succescriterium
De kern van v0.4.1 is geslaagd wanneer:
- zichtbaar scanvak en analyse-preview 1-op-1 overeenkomen;
- geen softwarematige links/rechts-offset meer bestaat;
- Camera Core stabiel blijft.

Pas daarna beoordelen we opnieuw de kwaliteit van de feature-based Recognition Engine.
