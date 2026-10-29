# Website bearbeiten – Anleitung für flexibel&stabil

Die Website hat einen eigenen Bearbeitungs-Bereich. Dort könnt ihr Termine, Tracks, Texte und Bilder ändern, ohne Code anzufassen.

**Adresse:** `https://fabianzimmmermann.github.io/flexibelundstabil/admin/`

---

## 1. Einmalig: Zugangsschlüssel (Token) erstellen

Der Token ist wie ein Passwort nur für die Website. Er darf ausschließlich die Dateien dieser einen Website ändern, sonst nichts.

1. Bei **github.com** einloggen.
2. Oben rechts aufs Profilbild → **Settings**.
3. Ganz unten links → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**.
4. **Generate new token** klicken.
5. Ausfüllen:
   - **Token name:** `Website bearbeiten`
   - **Expiration:** 1 Jahr (danach einfach einen neuen erstellen)
   - **Repository access:** **Only select repositories** → das Website-Repo auswählen
   - **Permissions → Repository permissions → Contents:** **Read and write**
   - Alles andere so lassen.
6. **Generate token** klicken und den Token (beginnt mit `github_pat_…`) kopieren.
   ⚠️ GitHub zeigt ihn nur einmal an.

## 2. Einloggen

1. Die Admin-Adresse öffnen (siehe oben).
2. **„Mit Zugriffstoken anmelden“** wählen und den Token einfügen.
   (Nicht „Mit GitHub anmelden“ – das funktioniert bei dieser Einrichtung nicht.)
3. Der Browser merkt sich den Token. Auf jedem neuen Gerät/Browser einmal neu einfügen.

## 3. Etwas ändern

Links seht ihr vier Bereiche:

| Bereich | Was ihr dort ändert |
|---|---|
| **Termine / Shows** | Neue Gigs eintragen. Vergangene werden automatisch als „Gespielt“ angezeigt. |
| **Musik, Releases & Sets** | Tracks hinzufügen, Reihenfolge ändern, Cover hochladen |
| **Startseite, Über uns & Booking** | Großes Bild oben, aktuelles Release, Laufband, Über-uns-Text, Social Links |
| **Impressum & Datenschutz** | Rechtstexte |

**Neuen Termin eintragen:** Termine / Shows → **Add Termin** → Datum, Location, Stadt (optional), Ticket-Link (optional) → **Save**.

**Neuen Track hinzufügen:** Musik → bei „Neue Musik“ **Add Track** → Titel und SoundCloud-Link einfügen → Cover hochladen → nach ganz oben ziehen → **Save**.

**Texte auf Deutsch und Englisch:** Fast jeder Text hat zwei Felder, „(Deutsch)“ und „(English)“. Bitte beide ausfüllen. Ist eins leer, wird das andere angezeigt.

Nach **Save** ist die Änderung nach ca. **1–2 Minuten** auf der Website. Falls nicht: Seite neu laden (Strg + F5 / am Handy Tab schließen und neu öffnen).

## 4. Sicherheit – bitte beachten

- **Token wie ein Passwort behandeln.** Nicht per WhatsApp/Mail verschicken, nirgends posten.
- **Zwei-Faktor-Anmeldung bei GitHub einschalten** (Settings → Password and authentication). Das ist der wichtigste Schutz.
- **Laptop verloren oder Token geleakt?** github.com → Settings → Developer settings → Fine-grained tokens → Token **löschen**. Er ist sofort ungültig. Dann einen neuen erstellen.
- **Etwas kaputt gemacht?** Keine Panik: Jede Änderung wird bei GitHub gespeichert und kann rückgängig gemacht werden.

## 5. Bilder

- Cover: quadratisch, ca. 800 × 800 px, JPG.
- Hintergrundbild oben: Querformat, mindestens 2000 px breit.
- Nur Bilder hochladen, an denen ihr die Rechte habt (eigene Fotos, eigene Cover).
