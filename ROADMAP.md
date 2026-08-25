# Gift AR — Master Roadmap

## Huidige status
- Stabiele baseline: v0.2.0 Camera Core
- Huidige candidate: v0.6.0 Object Isolation Core
- Huidige hoofdfase: Fase 4 — Recognition Core 2.0

## Architectuur
- Camera / Input
- Registration
- Object Isolation
- Recognition
- Gift / Project State
- WebXR / AR Engine
- World / Placement
- Experience Engine
- Renderer
- Asset Manager
- UI
- AI Assistance

## Roadmap
- [x] Fase 0 — Projectfundament & modulaire architectuur
- [x] Fase 1 — Camera Core
- [x] Fase 2 — Registration Prototype
- [x] Fase 3 — Recognition PoC / onderzoek
  - [x] globale beeldvergelijking onderzocht
  - [x] feature-based recognition onderzocht
  - [x] camera/scan alignment onderzocht
  - [x] objectisolatie als ontbrekende schakel vastgesteld
- [ ] Fase 4 — Recognition Core 2.0
  - [x] Registration Core 2.0
  - [ ] Multi-view Registration — candidate geïntegreerd in v0.6.0, telefoontest vereist
  - [ ] Object Isolation Core — v0.6.0 candidate
  - [ ] Isolation Quality Assistant
  - [ ] Echt AI-segmentatiemodel
  - [ ] AI Registration Assistant
  - [ ] Dynamic View Coverage
- [ ] Fase 5 — Gift Visual Profile
- [ ] Fase 6 — Hybrid Recognition
  - [ ] klassieke features
  - [ ] AI embeddings
  - [ ] geometrische verificatie
  - [ ] object tracking
- [ ] Fase 7 — Recognition Validation
- [ ] Fase 8 — Gift / Project System
- [ ] Fase 9 — WebXR / AR Placement Core
- [ ] Fase 10 — Environment Understanding
- [ ] Fase 11 — Eerste echte Gift AR Experience
- [ ] Fase 12 — Experience Engine
- [ ] Fase 13 — AI Experience Assistance
- [ ] Fase 14 — Geavanceerde media/personages/effecten
- [ ] Fase 15 — Gift Link / Delivery
- [ ] Fase 16 — iPhone en XR/VR

## AI-regel
AI is een ondersteunende core-laag voor input én output. AI mag analyseren, segmenteren, embeddings maken, kwaliteit beoordelen, adviseren, interpreteren en optimaliseren. Project State, geometrie, tracking, WebXR lifecycle, Experience-validatie en rendering blijven deterministisch eigendom van de core.

## Object-isolationstrategie
v0.6.0 gebruikt eerst een lokale dependency-vrije baseline via dezelfde interface die later door een echt AI-segmentatiemodel kan worden vervangen. Handmatige ROI blijft altijd als veilige fallback bewaard.
