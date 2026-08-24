# Gift AR — v0.5.0

## Vaste app-link
https://gasvdv-lab.github.io/Gift_app/

## Status
CANDIDATE

## Stabiele baseline
v0.2.0 — Camera Core, bevestigd werkend op Android/Chrome.

## Doel
v0.5.0 introduceert Registration Core 2.0.

De oude registratie via een live scanvak wordt verlaten. De maker neemt nu eerst een foto, bevriest het frame en duidt daarna zelf exact aan welk fysiek object het cadeau is.

## Nieuwe flow
1. Object registreren
2. Camera fullscreen
3. Foto nemen
4. Beeld bevriest
5. Rechthoek rond cadeau tekenen
6. Selectie eventueel aanpassen via hoekpunten
7. `Bekijk selectie`
8. Preview: `Dit is wat Gift AR onthoudt`
9. Bevestigen of aanpassen
10. Eén aanzicht lokaal opslaan

## Nieuw
- Shutterknop
- Bevroren cameraframe
- Touchselectie
- Vier resize-handles
- Selectie opnieuw maken
- Crop-preview
- Bevestigen / aanpassen
- Eén opgeslagen aanzicht in LocalStorage
- Aanzicht blijft na herladen beschikbaar
- Opgeslagen aanzicht bekijken of verwijderen

## Bewust nog NIET
- meerdere aanzichten;
- AI-segmentatie;
- automatische objectcontour;
- recognition;
- quality scoring;
- Gift Visual Profile;
- WebXR / AR.

## Waarom één aanzicht?
Deze versie test uitsluitend de nieuwe registratiebasis. Multi-view wordt pas toegevoegd nadat foto → selectie → preview → opslag op de telefoon stabiel werkt.

## Android/Chrome testvolgorde
1. Open https://gasvdv-lab.github.io/Gift_app/
2. Controleer versie 0.5.0.
3. Voer Basistest uit.
4. Open `Object registreren`.
5. Controleer dat de achtercamera fullscreen opent.
6. Neem een foto.
7. Controleer dat exact dat beeld bevriest.
8. Sleep een rechthoek rond het cadeau.
9. Pas minstens twee hoekpunten aan.
10. Tik `Bekijk selectie`.
11. Controleer dat de preview exact overeenkomt met de gemaakte selectie.
12. Tik `Aanpassen` en verander de selectie.
13. Bekijk opnieuw.
14. Tik `Bevestig selectie`.
15. Controleer op het startscherm dat één aanzicht opgeslagen is.
16. Open `Opgeslagen aanzicht`.
17. Controleer dat de juiste crop zichtbaar is.
18. Herlaad de pagina.
19. Controleer dat het aanzicht behouden blijft.
20. Start opnieuw een registratie en ga met Terug naar huis.
21. Controleer dat de camera correct stopt.
22. Start registratie opnieuw.
23. Zet Chrome naar de achtergrond.
24. Keer terug en controleer dat de camera geen vastloper veroorzaakt.
25. Verwijder tenslotte het opgeslagen aanzicht en controleer dat de status terug `geen` wordt.

## Succescriteria
v0.5.0 is geslaagd wanneer:
- foto betrouwbaar bevriest;
- selectie via touch praktisch werkt;
- selectie aangepast kan worden;
- preview exact overeenkomt met de selectie;
- alleen de gekozen crop wordt opgeslagen;
- opgeslagen crop herladen overleeft;
- camera lifecycle van v0.2.0 intact blijft.

## Volgende fase
Na bevestiging:
v0.5.1 — Multi-view Registration.

Daarna:
AI Object Isolation → AI Registration Assistant → Dynamic View Coverage → Gift Visual Profile → Hybrid Recognition.
