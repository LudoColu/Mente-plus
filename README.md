# Mente+ — Allenamento di calcolo mentale per iPhone

Un prototipo di web app (PWA) in italiano. Nessuna dipendenza, nessun account, nessun database e nessun costo software obbligatorio.

## Funzionalità

- **Allenamento:** 10 operazioni, senza limite di tempo.
- **Sprint:** quante più operazioni possibili in 60 secondi.
- **Tre livelli iniziali:** base, intermedio e avanzato.
- **Difficoltà adattiva:** sale dopo tre risposte corrette consecutive e scende dopo due errori consecutivi.
- **Operazioni:** addizioni, sottrazioni, moltiplicazioni e divisioni esatte.
- **Progressi:** accuratezza, XP, serie di giorni consecutivi e record dello sprint.
- **Privacy:** tutti i risultati restano nel browser/dispositivo (localStorage); non sono trasmessi ad alcun server.
- **Offline:** disponibile dopo il primo caricamento su un hosting HTTPS, grazie al service worker.

## Come provarla sul computer

Apri un terminale nella cartella con `index.html`, poi esegui:

```sh
python3 -m http.server 8000
```

Apri `http://localhost:8000` nel browser. In alternativa puoi aprire `index.html` direttamente sul computer (alcune funzioni come l'offline non funzionano da file locali).

## Come usarla sull'iPhone (senza Mac)

Per aggiungerla alla schermata Home, i file devono essere **pubblicati come sito HTTPS**. Non basta scaricare lo ZIP.

### Pubblicazione gratuita su GitHub Pages

1. Crea un repository GitHub (ad esempio `mente-plus`) e rendilo pubblico.
2. Carica **tutti i file di questa cartella nella radice del repository**, non il file ZIP compresso. È importante che `index.html` sia nella radice.
3. Nelle impostazioni del repository, apri **Settings → Pages**.
4. In **Build and deployment** seleziona **Deploy from a branch**, ramo `main`, cartella `/(root)` e salva.
5. Apri l'URL HTTPS che GitHub Pages mostra una volta terminata la pubblicazione. In genere sarà simile a `https://NOMEUTENTE.github.io/mente-plus/`.
6. Sul tuo iPhone apri quel link in **Safari** → menu Condividi → **Aggiungi alla schermata Home** → lascia attivo **Apri come app web** → **Aggiungi**.
7. Da quel momento puoi avviare Mente+ dall'icona sulla Home. Dopo il primo caricamento con connessione, il service worker la rende utilizzabile anche senza rete (purché Safari non ne elimini i dati offline).

**Nota:** i dati salvati nella versione aperta in Safari e quelli nella versione aggiunta alla Home possono usare spazi di archiviazione distinti. Per conservare i progressi usa sempre la stessa versione. I dati possono andare persi cancellando quelli del sito/app o reinstallando l'app web.

## File

- `index.html` — ingresso dell'app
- `styles.css` — interfaccia responsive, ottimizzata per touch
- `engine.js` — generazione di problemi e logica di streak
- `app.js` — schermate, modalità, salvataggio dei progressi
- `manifest.webmanifest` — icona e configurazione installabile
- `sw.js` — file disponibili offline
- `icon.svg` e file `.png` — icone

## Personalizzazioni

I colori sono definiti all'inizio di `styles.css`. La gamma numerica dei livelli si trova in `engine.js` dentro `makeProblem()`. Lo sprint dura 60 secondi; puoi modificarlo in `app.js` cercando `60000` e i riferimenti a `60`.

## Limiti di questa versione

È una web app installabile da Safari, **non** un'app nativa disponibile sull'App Store. Non esistono ancora un profilo cloud, login o sincronizzazione tra dispositivi. L'esecuzione su iPhone e la procedura di pubblicazione non sono state collaudate su un dispositivo fisico: questo pacchetto è un prototipo da testare.
