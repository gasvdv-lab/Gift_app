# Gift AR — v0.6.0

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel
v0.6.0 voegt één nieuwe laag toe: Object Isolation.

Bestaande registratieflow:
foto → beeld bevriezen → maker selecteert ROI.

Nieuw:
ROI → isolatie → maker controleert resultaat → isolatie accepteren of handmatige crop behouden → aanzicht opslaan.

## Belangrijke technische eerlijkheid
v0.6.0 bevat nog GEEN zwaar AI-segmentatiemodel.

Waarom:
- we willen geen externe dependency of server invoeren voordat de flow stabiel is;
- eerst moet bewezen worden dat objectmaskers correct in Registration/Profile-data kunnen worden opgeslagen;
- AI Assistance is architecturaal aanwezig, maar het daadwerkelijke AI-model komt later.

De huidige isolatie gebruikt een lokale browser-side baseline:
- achtergrondkleur geschat uit de randen van de geselecteerde ROI;
- kleurverschil + centrumprioriteit;
- eenvoudige masker-smoothing;
- transparant PNG-objectmasker.

De module heet `object-isolation.js` en is AI-ready: een later segmentatiemodel kan dezelfde input/output-interface overnemen.

## Nieuwe UI
Na `Bekijk selectie` ziet de maker:
- Handmatige selectie
- Geïsoleerd object
- percentage behouden objectpixels
- methode
- isolatiegevoeligheid
- Opnieuw isoleren
- Gebruik isolatie
- Behoud handmatige crop
- Selectie aanpassen

## Data per view
Een opgeslagen view bevat nu:
- manualCropDataUrl
- sourceRect
- afmetingen
- isolation.accepted
- isolation.isolatedDataUrl (indien geaccepteerd)
- isolation.objectRatio
- isolation.method
- isolation.sensitivity
- savedAt

De originele handmatige crop blijft altijd bewaard. Een slecht isolatieresultaat vernietigt dus nooit de registratie.

## Bewust nog NIET
- AI-segmentatiemodel
- quality scoring
- automatische viewpoint guidance
- embeddings
- recognition
- WebXR / AR

## Android/Chrome testvolgorde
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer v0.6.0.
3. Voer Basistest uit.
4. Camera openen/sluiten enkele keren.
5. Neem foto.
6. Selecteer cadeau.
7. Bekijk selectie.
8. Controleer links de handmatige crop.
9. Controleer rechts het geïsoleerde object.
10. Verander de gevoeligheid en tik Opnieuw isoleren.
11. Controleer of het masker zichtbaar verandert.
12. Test `Gebruik isolatie`.
13. Open galerij en controleer dat transparante isolatie wordt getoond.
14. Maak een tweede view en kies bewust `Behoud handmatige crop`.
15. Controleer in galerij dat beide typen naast elkaar kunnen bestaan.
16. Registreer minimaal 3 views.
17. Herlaad de pagina.
18. Controleer dat alle data behouden blijft.
19. Verwijder één view.
20. Controleer dat andere views intact blijven.
21. Zet Chrome tijdens camera naar achtergrond en test daarna opnieuw starten.

## Testobjecten
Test idealiter drie niveaus:
1. makkelijk: contrastrijk object op rustige achtergrond;
2. normaal: cadeau op gewone tafel;
3. moeilijk: steen op natuurlijke/drukke achtergrond.

## Succescriteria
- isolation module crasht Registration niet;
- geïsoleerd resultaat is zichtbaar controleerbaar;
- maker kan altijd terugvallen op handmatige crop;
- isolatiekeuze blijft na reload bewaard;
- meerdere views blijven stabiel;
- Camera Core blijft intact.

## Volgende fase
Na bevestiging:
v0.6.1 — Isolation Quality Assistant.

Daarna:
AI segmentation model → Dynamic View Coverage → Gift Visual Profile → Hybrid Recognition.
