# Gift AR — v0.3.2

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel
v0.3.2 onderzoekt lichtrobustheid van de Recognition Engine.

Aanleiding: hetzelfde geregistreerde object zakte bij veranderend avondlicht van ongeveer 88% naar 63–66%. De UI-correctie uit v0.3.1 blijft behouden.

## Wat verandert
- Geen wijziging aan Camera Core.
- Geen wijziging aan fullscreen recognition-UI.
- Nieuwe descriptor die veel minder op absolute helderheid steunt.
- Sterker genormaliseerde lokale structuur.
- Edge/randdescriptor krijgt het grootste gewicht.
- Kleurinformatie is teruggebracht tot slechts 5%.
- Eén `Registreer aanzicht` verzamelt nu 7 frames over ongeveer 0,8 seconde.
- Die frames worden gemiddeld tot één stabieler referentieprofiel.
- Nieuwe, voorlopige herkenningsdrempel: 74%.

## Belangrijk
De percentages van v0.3.2 zijn NIET rechtstreeks vergelijkbaar met v0.3.1.
Het algoritme en dus de schaal van de scores is gewijzigd.

We beoordelen vooral de scheiding tussen:
- juist object;
- verkeerd object;
- andere achtergrond;
- ander licht.

Een lager absoluut percentage kan beter zijn als verkeerde objecten nog veel lager scoren.

## Opslag
v0.3.2 gebruikt een nieuwe LocalStorage-sleutel.
Registraties uit v0.3.0/v0.3.1 worden bewust niet hergebruikt omdat de descriptor incompatibel is.

## Praktijktest

### A — regressie
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie 0.3.2.
3. Voer Basistest uit.
4. Open/sluit camera minstens 5 keer.
5. Controleer fullscreen UI en terugknop.

### B — nieuwe registratie
6. Kies Object registreren.
7. Plaats het object zo groot mogelijk binnen het kader.
8. Tik Registreer aanzicht.
9. Houd object ongeveer 1 seconde stil terwijl 7 samples worden verzameld.
10. Draai ongeveer 20–40 graden.
11. Registreer aanzicht 2.
12. Draai opnieuw.
13. Registreer aanzicht 3.

### C —zelfde licht
14. Open Object herkennen.
15. Test het juiste object.
16. Noteer typische en hoogste score.
17. Test minstens drie verkeerde objecten.
18. Noteer de hoogste foute score.

### D — ander licht
19. Verander de verlichting duidelijk, bijvoorbeeld lamp aan/uit of andere kamer.
20. Test opnieuw het juiste object.
21. Noteer typische en hoogste score.
22. Test opnieuw een verkeerd object.

### E — achtergrond
23. Plaats het juiste object op een andere ondergrond/achtergrond.
24. Test opnieuw.
25. Test de oorspronkelijke achtergrond zonder het object.

## Wat terugkoppelen
- juiste object, zelfde licht: typische/hoogste score;
- juiste object, ander licht: typische/hoogste score;
- verkeerd object: hoogste score;
- originele achtergrond zonder object: hoogste score;
- of er valse `CADEAU HERKEND` meldingen waren.

## Succescriterium
v0.3.2 is geslaagd als veranderend licht de score minder sterk beïnvloedt én het juiste object duidelijk beter blijft scoren dan verkeerde objecten.

## Volgende stap
Als lichtrobustheid voldoende is: v0.3.3 — Background & Viewpoint Robustness.
Als de scores onvoldoende scheiden, vervangen we de Recognition Engine in plaats van verder kleine patches te stapelen.
