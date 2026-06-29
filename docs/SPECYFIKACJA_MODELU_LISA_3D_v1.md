# SPECYFIKACJA MODELU LISA 3D v1

## Cel
Docelowy model ma odwzorowywać przesłane rendery: półrealistyczny, przyjazny lis w sportowej stylizacji MOKSiAL / Szklarska Poręba, przeznaczony do animacji w digital signage.

## Format końcowy
- plik główny: `assets/model/fox-mascot.glb`
- standard: glTF 2.0 / GLB
- jedna postać z rigiem
- tekstury PBR osadzone w GLB lub w katalogu `assets/model/textures/`
- jednostki: metry
- pivot całego modelu na podłożu między stopami
- pozycja neutralna skierowana twarzą do kamery

## Sylwetka
- proporcje jak na renderach referencyjnych
- duża głowa, duże uszy, duże bursztynowe oczy
- smukły, młodzieżowy tułów
- duży puszysty ogon z jasną końcówką
- dłonie z widocznymi palcami
- sneakersy o masywnej podeszwie

## Futro
- kolor bazowy: rudy / pomarańczowy
- jaśniejsze policzki, pyszczek, szyja i końcówka ogona
- ciemniejsze końcówki uszu i subtelne cienie wokół brwi
- półrealistyczna kierunkowa struktura sierści
- bez ciężkiego hair systemu w czasie rzeczywistym
- zalecane: normal map + detail map + delikatny rim/fuzz shader

## Twarz
- duże bursztynowe tęczówki
- ciemne źrenice i jasne catchlighty
- czarny, lekko błyszczący nos
- przyjazny uśmiech
- osobne powieki lub blendshapes do mrugania
- blendshapes: `Smile`, `Surprise`, `Blink_L`, `Blink_R`, `Mouth_Open`

## Bluza
- baza kremowa
- kaptur, mankiety, pas dolny i boczne pasy zielone
- widoczna faktura dzianiny / bawełny
- sznurki kaptura jako osobna geometria
- logo MOKSiAL na piersi
- logo Szklarska Poręba na kieszeni

## Spodnie
- ciemnozielone
- boczne jaśniejsze panele
- kieszenie cargo / sportowe
- delikatna faktura materiału
- ściągacze przy nogawkach

## Buty
- zielono-kremowe sneakersy
- pomarańczowe detale
- gruba jasna podeszwa
- sznurówki jako geometria lub alpha card

## Materiały
- `MAT_Fur_Orange`
- `MAT_Fur_Cream`
- `MAT_Fur_Dark`
- `MAT_Eyes`
- `MAT_Nose`
- `MAT_Hoodie_Cream`
- `MAT_Hoodie_Green`
- `MAT_Pants`
- `MAT_Shoes`
- `MAT_Logos`

## Rig
Kości wymagane:
- `Root`
- `Hips`
- `Spine_01`, `Spine_02`, `Chest`, `Neck`, `Head`
- `UpperArm_L/R`, `LowerArm_L/R`, `Hand_L/R`
- `Thigh_L/R`, `Shin_L/R`, `Foot_L/R`, `Toe_L/R`
- `Tail_01`–`Tail_05`
- opcjonalnie: `Ear_L/R`, `Hood_String_L/R`

## Animacje wymagane
- `Idle`
- `Walk`
- `Turn_L`
- `Turn_R`
- `Lean_LeftQR_RightHand`
- `Lean_RightQR_LeftHand`
- `Climb_Left`
- `Climb_Right`
- `Happy`
- `Surprised`
- `LookUp`
- `Wave`

## Zasady animacji
- chód płynny, bez ślizgania stóp
- ręce pracują przeciwnie do nóg
- ogon ma opóźnione follow-through
- głowa lekko stabilizowana
- przy lewym QR używana prawa ręka
- przy prawym QR używana lewa ręka
- poza opierania nie może przesuwać tułowia przed QR
- wspinanie może chwilowo wejść na kafelek, ale kończy się powrotem do safe zone

## Limity wydajności
- 40–80 tys. trójkątów
- 1–3 materiały na główne grupy
- tekstury maks. 2048 px dla ciała/ubrań
- normal maps maks. 2048 px
- brak ciężkich efektów transparentnych
- 30 fps na mini PC klasy i5-7400T / 8 GB

## Referencje
Za wzorzec przyjmujemy wszystkie rendery przesłane w rozmowie 29.06.2026: idle, walk, lean, climb, happy.
