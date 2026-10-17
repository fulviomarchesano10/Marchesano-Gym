import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://dkghztezhnheblmfkvzn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ2h6dGV6aG5oZWJsbWZrdnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzg3MDcsImV4cCI6MjEwNzcxNDcwN30.HYUi_VMGOe8oSUy02VOWqeeYsOuiyAZmhavFqQUJ-c0';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

const DUMBBELL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9v6M6 6v12M9 10v4M9 12h6M15 10v4M18 6v12M21 9v6"/></svg>';
const TRASH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg>';

const $ = (id) => document.getElementById(id);
let isRegister = false;
let currentUser = null;
let plans = [];
let activePage = 'home';
let toolBackAction = null;
let catalogLimit = 40;
let onlineCatalogLoaded = false;
let onlineCatalogLoading = false;
let favoritesOnly = false;
let diaryMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let diarySelectedDate = localDateKey(new Date());
let diarySessions = [];
let diaryOpenSessionId = null;
const FAVORITES_KEY_PREFIX = 'marchesanoGymFavorites:';
function localDateKey(date) { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function getFavoriteIds() { try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY_PREFIX + (currentUser?.id || 'guest')) || '[]').map(String)); } catch (_) { return new Set(); } }
function saveFavoriteIds(ids) { try { localStorage.setItem(FAVORITES_KEY_PREFIX + (currentUser?.id || 'guest'), JSON.stringify([...ids])); } catch (_) {} }
function isFavoriteExercise(item) { const ids=getFavoriteIds(); return ids.has(String(item.id || item.catalog_id || item.name)); }
function toggleFavoriteExercise(item) { const key=String(item.id || item.catalog_id || item.name); const ids=getFavoriteIds(); if(ids.has(key)) ids.delete(key); else ids.add(key); saveFavoriteIds(ids); renderExerciseCatalog(); }


// Catalogo integrato Marchesano Gym: varianti comuni per gruppo muscolare e attrezzatura.
const EXERCISE_CATALOG = [{"id":"panca-piana-bilanciere","name":"Panca piana con bilanciere","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Sdraiati con piedi ben piantati, scapole raccolte e polsi in linea con gli avambracci. Abbassa il bilanciere verso la parte media del petto con controllo, poi spingi mantenendo il bacino appoggiato e senza rimbalzare.","aliases":["panca piana","bench press","bilanciere panca"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"panca-piana-manubri","name":"Panca piana con manubri","muscle_group":"Petto","equipment":"Manubri","instructions":"Appoggia i piedi a terra e stabilizza le scapole. Porta i manubri ai lati del petto con gomiti leggermente sotto la linea delle spalle, quindi spingi verso l’alto senza farli urtare. Riduci la profondità se senti fastidio alla spalla.","aliases":["panca piana manubri","dumbbell bench press"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"panca-inclinata-bilanciere","name":"Panca inclinata con bilanciere","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Regola la panca su un’inclinazione moderata. Mantieni i piedi stabili e le scapole controllate; abbassa la barra verso la parte alta del petto e spingi seguendo una traiettoria fluida, senza sollevare il bacino.","aliases":["panca inclinata","incline bench press"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"panca-inclinata-manubri","name":"Panca inclinata con manubri","muscle_group":"Petto","equipment":"Manubri","instructions":"Siediti sulla panca inclinata con il busto stabile. Scendi lentamente con i manubri ai lati della parte alta del torace, mantenendo i gomiti sotto controllo; spingi senza perdere la posizione delle scapole.","aliases":["panca inclinata manubri"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"chest-press","name":"Chest press alla macchina","muscle_group":"Petto","equipment":"Macchina","instructions":"Regola sedile e impugnature affinché le mani partano all’altezza del torace. Spingi in avanti senza inarcare la schiena e ritorna lentamente finché senti un allungamento confortevole.","aliases":["chest press","macchina petto"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"croci-manubri-piana","name":"Croci con manubri su panca piana","muscle_group":"Petto","equipment":"Manubri","instructions":"Con i manubri sopra il petto, mantieni i gomiti leggermente piegati e fermi. Apri le braccia ad arco fino a un allungamento gestibile, poi riporta i manubri sopra il torace senza trasformare il gesto in una distensione.","aliases":["croci panca piana","fly manubri"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"croci-cavi","name":"Croci ai cavi","muscle_group":"Petto","equipment":"Cavi","instructions":"Posizionati al centro della stazione con un piede avanti e busto stabile. Porta le maniglie davanti al torace descrivendo un arco, mantieni una lieve flessione dei gomiti e riapri lentamente senza perdere tensione.","aliases":["croci ai cavi","cable fly"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"pec-deck","name":"Pec deck (butterfly)","muscle_group":"Petto","equipment":"Macchina","instructions":"Regola il sedile in modo che le impugnature siano all’altezza del petto. Avvicina le braccia senza sollevare le spalle, fai una breve pausa e torna indietro lentamente senza forzare l’apertura.","aliases":["butterfly","pec deck"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"push-up","name":"Piegamenti sulle braccia","muscle_group":"Petto","equipment":"Corpo libero","instructions":"Allinea testa, bacino e talloni in una linea stabile. Scendi piegando i gomiti in diagonale rispetto al busto, poi spingi il pavimento fino a distendere le braccia senza perdere la posizione del tronco.","aliases":["push up","flessioni","piegamenti"],"level":"Principiante","goal":"Forza generale","source":"marchesano"},{"id":"dip-petto","name":"Dip alle parallele (focus petto)","muscle_group":"Petto","equipment":"Parallele","instructions":"Sostieniti alle parallele, inclina leggermente il busto in avanti e controlla la discesa piegando i gomiti. Risali spingendo con fluidità; usa assistenza o riduci la profondità se le spalle non tollerano il movimento.","aliases":["dip petto","parallele"],"level":"Avanzato","goal":"Forza e massa","source":"marchesano"},{"id":"lat-machine","name":"Lat machine presa prona","muscle_group":"Schiena","equipment":"Lat machine","instructions":"Blocca le cosce sotto i cuscinetti e mantieni il busto quasi verticale. Porta la barra davanti al petto guidando i gomiti verso il basso; risali lentamente senza dondolare né tirare la barra dietro la nuca.","aliases":["lat machine","pulley alto","lat pulldown","lat machine davanti al petto","lat machine frontale"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"trazioni-prone","name":"Trazioni alla sbarra presa prona","muscle_group":"Schiena","equipment":"Sbarra","instructions":"Afferra la sbarra poco oltre la larghezza delle spalle e parti con il corpo controllato. Porta il petto verso la sbarra guidando i gomiti in basso, poi scendi lentamente; usa elastico o macchina assistita se necessario.","aliases":["trazioni","pull up","pull-up"],"level":"Avanzato","goal":"Forza","source":"marchesano"},{"id":"rematore-bilanciere","name":"Rematore con bilanciere","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Fletti le anche e mantieni la schiena neutra, con addome attivo. Tira il bilanciere verso la parte bassa del torace senza strappare, poi distendi le braccia controllando il ritorno.","aliases":["rematore bilanciere","bent over row"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"rematore-manubrio","name":"Rematore con manubrio a un braccio","muscle_group":"Schiena","equipment":"Manubrio","instructions":"Appoggia una mano e un ginocchio sulla panca, mantenendo il busto stabile. Tira il manubrio verso il fianco senza ruotare il tronco, poi abbassalo lentamente fino a distendere il braccio.","aliases":["rematore manubrio","one arm row"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"pulley-basso","name":"Pulley basso da seduto","muscle_group":"Schiena","equipment":"Cavi","instructions":"Siediti con ginocchia leggermente flesse e busto stabile. Tira la maniglia verso l’addome portando i gomiti indietro, senza oscillare; ritorna lentamente lasciando avanzare le scapole in modo controllato.","aliases":["pulley","seated cable row"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"rematore-tbar","name":"Rematore T-bar","muscle_group":"Schiena","equipment":"T-bar","instructions":"Posiziona i piedi saldi e inclina il busto mantenendo la colonna neutra. Tira la presa verso il tronco, avvicina le scapole senza sollevare le spalle e abbassa il carico senza perdere tensione.","aliases":["t bar row","rematore t-bar"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"pulldown-braccia-tese","name":"Pulldown ai cavi a braccia tese","muscle_group":"Schiena","equipment":"Cavi","instructions":"In piedi davanti ai cavi, inclina appena il busto e mantieni i gomiti quasi fermi. Porta la barra verso le cosce usando il movimento delle spalle, poi ritorna lentamente senza inarcare la schiena.","aliases":["straight arm pulldown","braccia tese cavi"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"iperestensioni","name":"Estensioni del tronco su panca romana","muscle_group":"Schiena","equipment":"Panca romana","instructions":"Regola il supporto appena sotto le anche. Scendi flettendo il bacino e mantenendo la schiena neutra, poi risali fino ad allineare il corpo senza iperestendere la zona lombare.","aliases":["iperestensioni","back extension"],"level":"Intermedio","goal":"Controllo del tronco","source":"marchesano"},{"id":"pullover-cavo","name":"Pullover ai cavi","muscle_group":"Schiena","equipment":"Cavi","instructions":"Tieni i gomiti leggermente piegati e il busto stabile. Porta la barra dall’altezza del viso verso le cosce muovendo le spalle, poi ritorna lentamente senza trasformare l’esercizio in una spinta di tricipiti.","aliases":["pullover cavi"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"lento-avanti-manubri","name":"Spinte sopra la testa con manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Siediti con schiena sostenuta o resta in piedi con addome contratto. Spingi i manubri sopra la testa senza inarcare la zona lombare, poi abbassali ai lati delle spalle con controllo.","aliases":["shoulder press","lento avanti manubri","lento seduto con manubri","spinte seduto sopra la testa con manubri"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"military-press","name":"Lento avanti con bilanciere","muscle_group":"Spalle","equipment":"Bilanciere","instructions":"Tieni glutei e addome attivi, con bilanciere appoggiato davanti alle spalle. Spingi verticalmente passando con la testa sotto la barra quando supera il viso; abbassa alla posizione iniziale senza iperestendere la schiena.","aliases":["military press","overhead press","lento avanti in piedi con bilanciere","military press in piedi"],"level":"Avanzato","goal":"Forza","source":"marchesano"},{"id":"alzate-laterali","name":"Alzate laterali con manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Con gomiti morbidi e busto fermo, solleva i manubri lateralmente fino a circa l’altezza delle spalle. Guida con i gomiti, evita slanci e abbassa lentamente.","aliases":["lateral raise","alzate laterali"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"reverse-fly","name":"Aperture inverse per deltoidi posteriori","muscle_group":"Spalle","equipment":"Manubri","instructions":"Inclina il busto con schiena neutra e braccia sotto le spalle. Apri i manubri lateralmente stringendo dolcemente le scapole, senza slanciare il tronco; torna alla posizione iniziale lentamente.","aliases":["reverse fly","deltoidi posteriori"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"face-pull","name":"Face pull ai cavi","muscle_group":"Spalle","equipment":"Cavi","instructions":"Imposta la corda all’altezza del viso. Tira verso fronte e tempie separando le mani, con gomiti aperti e spalle lontane dalle orecchie; ritorna lentamente mantenendo il busto fermo.","aliases":["face pull","tirate al viso"],"level":"Principiante","goal":"Stabilità scapolare","source":"marchesano"},{"id":"arnold-press","name":"Arnold press con manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Parti con i manubri davanti alle spalle e i palmi rivolti verso di te. Ruota gli avambracci mentre spingi sopra la testa, poi ripercorri il movimento senza forzare la rotazione.","aliases":["arnold press"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"alzate-frontali","name":"Alzate frontali con manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Con busto stabile, solleva i manubri davanti al corpo fino all’altezza delle spalle. Mantieni i gomiti morbidi, evita di oscillare e scendi lentamente.","aliases":["front raise","alzate frontali"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"curl-bilanciere","name":"Curl con bilanciere","muscle_group":"Bicipiti","equipment":"Bilanciere","instructions":"In piedi, tieni i gomiti vicini ai fianchi e i polsi allineati. Fletti i gomiti sollevando la barra senza dondolare il busto, poi abbassa lentamente fino quasi a distendere le braccia.","aliases":["curl bilanciere","barbell curl"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"curl-manubri","name":"Curl alternato con manubri","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Mantieni il busto fermo e le braccia lungo i fianchi. Solleva un manubrio ruotando il palmo verso l’alto se confortevole, quindi abbassalo lentamente prima di alternare il lato.","aliases":["curl manubri","dumbbell curl"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"curl-panca-inclinata","name":"Curl con manubri su panca inclinata","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Appoggia la schiena alla panca inclinata e lascia le braccia distese ai lati. Fletti i gomiti senza spostare le spalle in avanti e torna lentamente alla posizione iniziale.","aliases":["incline curl"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"curl-martello","name":"Curl a martello","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Tieni i palmi rivolti uno verso l’altro e i gomiti vicino al busto. Solleva i manubri senza ruotare i polsi, poi abbassa in modo controllato evitando slanci.","aliases":["hammer curl","curl martello"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"curl-panca-scott","name":"Curl alla panca Scott","muscle_group":"Bicipiti","equipment":"Panca Scott","instructions":"Appoggia bene la parte posteriore delle braccia sul supporto. Fletti i gomiti senza staccare le braccia dalla panca e scendi lentamente senza bloccare bruscamente l’articolazione.","aliases":["preacher curl","panca scott"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"pushdown-corda","name":"Push-down per tricipiti con corda","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Mantieni i gomiti aderenti ai fianchi e le spalle ferme. Estendi gli avambracci verso il basso, separando leggermente le estremità della corda alla fine, poi risali senza spostare i gomiti.","aliases":["pushdown","triceps pushdown"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"french-press-manubrio","name":"Estensioni sopra la testa con manubrio","muscle_group":"Tricipiti","equipment":"Manubrio","instructions":"Sostieni il manubrio sopra la testa con gomiti rivolti in avanti. Piega i gomiti portando il carico dietro la testa entro un’ampiezza confortevole, poi estendi senza inarcare la schiena.","aliases":["french press","overhead triceps extension"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"panca-presa-stretta","name":"Panca piana presa stretta","muscle_group":"Tricipiti","equipment":"Bilanciere","instructions":"Usa una presa poco più stretta delle spalle, non eccessivamente ravvicinata. Abbassa il bilanciere mantenendo i polsi allineati e i gomiti vicini al busto, poi spingi senza rimbalzo e con assistenza se necessario.","aliases":["close grip bench press","panca stretta"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"estensioni-tricipiti-cavo","name":"Estensioni tricipiti al cavo sopra la testa","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Dai le spalle alla carrucola e porta la corda dietro la testa. Mantieni i gomiti orientati in avanti, estendi gli avambracci senza muovere il tronco e ritorna lentamente.","aliases":["overhead cable extension"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"kickback-tricipiti","name":"Kickback per tricipiti con manubrio","muscle_group":"Tricipiti","equipment":"Manubrio","instructions":"Inclina il busto mantenendo la schiena neutra e il braccio vicino al fianco. Estendi il gomito fino ad allineare l’avambraccio al braccio, poi ritorna senza oscillare la spalla.","aliases":["triceps kickback"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"squat-bilanciere","name":"Squat con bilanciere","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Posiziona la barra stabile sulle spalle e crea pressione addominale prima di scendere. Piega anche e ginocchia mantenendo i piedi radicati e le ginocchia in linea con le punte; risali senza perdere l’assetto del tronco.","aliases":["back squat","squat bilanciere"],"level":"Avanzato","goal":"Forza e massa","source":"marchesano"},{"id":"front-squat","name":"Squat frontale","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Appoggia il bilanciere davanti alle spalle con gomiti alti e busto verticale. Scendi mantenendo il tronco stabile e le ginocchia in linea con i piedi, poi risali spingendo il pavimento.","aliases":["front squat"],"level":"Avanzato","goal":"Forza","source":"marchesano"},{"id":"pressa-45","name":"Pressa a 45 gradi","muscle_group":"Gambe","equipment":"Pressa","instructions":"Appoggia completamente la schiena allo schienale e posiziona i piedi alla larghezza gestibile. Sblocca la slitta, scendi senza sollevare il bacino e spingi senza bloccare bruscamente le ginocchia.","aliases":["leg press","pressa gambe"],"level":"Principiante","goal":"Forza e massa","source":"marchesano"},{"id":"leg-extension","name":"Leg extension","muscle_group":"Gambe","equipment":"Macchina","instructions":"Regola il sedile e allinea il perno della macchina al ginocchio. Estendi le gambe con controllo, fai una breve contrazione dei quadricipiti e abbassa il rullo senza lasciarlo cadere.","aliases":["leg extension","estensioni ginocchia"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"leg-curl-seduto","name":"Leg curl da seduto","muscle_group":"Gambe","equipment":"Macchina","instructions":"Allinea il ginocchio al perno e blocca il supporto sulle cosce. Fletti le ginocchia portando il rullo verso il basso, poi ritorna lentamente mantenendo il bacino aderente al sedile.","aliases":["seated leg curl"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"leg-curl-sdraiato","name":"Leg curl da sdraiato","muscle_group":"Gambe","equipment":"Macchina","instructions":"Sdraiati mantenendo il bacino stabile e allinea le ginocchia al perno. Porta il rullo verso i glutei senza sollevare le anche e abbassa lentamente fino alla posizione iniziale.","aliases":["lying leg curl"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"affondi-manubri","name":"Affondi in camminata con manubri","muscle_group":"Gambe","equipment":"Manubri","instructions":"Tieni i manubri ai lati e fai un passo abbastanza ampio. Scendi finché entrambe le ginocchia si flettono in modo controllato, mantenendo il ginocchio anteriore allineato al piede; spingi per avanzare.","aliases":["walking lunges","affondi manubri"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"bulgarian-split-squat","name":"Squat bulgaro","muscle_group":"Gambe","equipment":"Manubri","instructions":"Appoggia il piede posteriore su una panca bassa e trova una distanza stabile. Scendi in verticale mantenendo il piede anteriore ben appoggiato, poi risali spingendo attraverso tutta la pianta del piede.","aliases":["bulgarian split squat","squat bulgaro"],"level":"Avanzato","goal":"Forza e massa","source":"marchesano"},{"id":"stacco-rumeno","name":"Stacco rumeno con bilanciere","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Parti in piedi con barra vicino alle cosce. Spingi il bacino indietro con ginocchia leggermente flesse e schiena neutra, abbassa finché mantieni tensione nei femorali, poi risali estendendo le anche.","aliases":["romanian deadlift","stacco rumeno"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"stacco-convenzionale","name":"Stacco da terra convenzionale","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Avvicina la barra alle tibie, afferra saldamente e crea tensione prima di sollevare. Spingi il pavimento mantenendo la barra vicina al corpo e la schiena stabile; termina in piedi senza inclinarti all’indietro.","aliases":["deadlift","stacco da terra"],"level":"Avanzato","goal":"Powerlifting","source":"marchesano"},{"id":"stacco-trap-bar","name":"Stacco con trap bar","muscle_group":"Gambe","equipment":"Trap bar","instructions":"Centra il corpo nella trap bar, afferra le maniglie e stabilizza il tronco. Spingi attraverso il pavimento mantenendo il carico vicino al corpo, poi riappoggia flettendo anche e ginocchia in modo controllato.","aliases":["trap bar deadlift"],"level":"Intermedio","goal":"Forza generale","source":"marchesano"},{"id":"hip-thrust","name":"Hip thrust con bilanciere","muscle_group":"Glutei","equipment":"Bilanciere","instructions":"Appoggia la parte alta della schiena alla panca e posiziona il bilanciere sul bacino con protezione. Spingi attraverso i piedi fino ad allineare tronco e cosce, contraendo i glutei senza inarcare la zona lombare.","aliases":["hip thrust","bridge schiena su panca con bilanciere","bridge su panca con bilanciere","hip thrust bilanciere"],"level":"Intermedio","goal":"Forza e massa","source":"marchesano"},{"id":"glute-bridge","name":"Ponte glutei a terra","muscle_group":"Glutei","equipment":"Corpo libero","instructions":"Sdraiati con ginocchia piegate e piedi a terra. Solleva il bacino contraendo i glutei fino ad allineare anche e tronco, fai una breve pausa e scendi lentamente senza inarcare la schiena.","aliases":["glute bridge","ponte glutei"],"level":"Principiante","goal":"Attivazione e controllo","source":"marchesano"},{"id":"abduzione-anca","name":"Abduzioni dell’anca alla macchina","muscle_group":"Glutei","equipment":"Macchina","instructions":"Siediti con schiena appoggiata e ginocchia contro i cuscinetti. Apri le gambe senza slanci, mantieni brevemente la contrazione e ritorna lentamente senza far chiudere di colpo la macchina.","aliases":["abductor machine","abduzioni"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"calf-raise","name":"Calf raise in piedi","muscle_group":"Polpacci","equipment":"Macchina","instructions":"Posiziona l’avampiede sul supporto e mantieni le ginocchia distese ma non bloccate. Scendi lentamente fino a un allungamento confortevole, poi sali sulle punte senza rimbalzare.","aliases":["standing calf raise","polpacci"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"calf-raise-seduto","name":"Calf raise da seduto","muscle_group":"Polpacci","equipment":"Macchina","instructions":"Posiziona gli avampiedi sul supporto e il cuscinetto sulle cosce. Abbassa i talloni con controllo, poi spingi sulle punte e mantieni una breve contrazione in alto.","aliases":["seated calf raise"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"panca-powerlifting","name":"Panca piana stile powerlifting","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Sistema piedi e scapole prima di staccare la barra dai supporti. Mantieni i glutei sulla panca, porta la barra al punto di contatto scelto sul torace con controllo e spingi seguendo una traiettoria stabile. Allenati con spotter e sicurezze regolate.","aliases":["powerlifting bench","panca gara"],"level":"Avanzato","goal":"Powerlifting","source":"marchesano"},{"id":"squat-powerlifting","name":"Squat stile powerlifting","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Regola la posizione della barra e crea pressione addominale prima di iniziare. Scendi mantenendo equilibrio sul piede e controllo del busto, raggiungi una profondità ripetibile e risali senza perdere la traiettoria. Usa rack con sicurezze.","aliases":["powerlifting squat","squat gara"],"level":"Avanzato","goal":"Powerlifting","source":"marchesano"},{"id":"stacco-sumo","name":"Stacco sumo","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Imposta una stance ampia e afferra la barra all’interno delle gambe. Spingi le ginocchia verso la direzione delle punte e crea tensione prima del distacco; solleva mantenendo la barra vicina e chiudi in posizione eretta.","aliases":["sumo deadlift","stacco sumo"],"level":"Avanzato","goal":"Powerlifting","source":"marchesano"},{"id":"pausa-panca","name":"Panca piana con pausa al petto","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Esegui la discesa come una panca controllata, fermando la barra immobile sul torace senza rilassare le spalle. Dopo la pausa, spingi in modo deciso mantenendo piedi, scapole e bacino stabili.","aliases":["paused bench press","panca con pausa"],"level":"Avanzato","goal":"Forza massimale","source":"marchesano"},{"id":"squat-pausa","name":"Squat con pausa","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Scendi con il tuo assetto abituale e fermati nella posizione bassa senza rimbalzare. Mantieni tensione nell’addome e nei piedi durante la pausa, poi risali conservando la traiettoria.","aliases":["pause squat"],"level":"Avanzato","goal":"Forza tecnica","source":"marchesano"},{"id":"stacco-pausa","name":"Stacco con pausa sotto il ginocchio","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Imposta lo stacco con barra vicina alle tibie e schiena stabile. Solleva fino a poco sotto il ginocchio, fai una pausa mantenendo tensione e poi completa la salita senza allontanare la barra dal corpo.","aliases":["paused deadlift"],"level":"Avanzato","goal":"Forza tecnica","source":"marchesano"},{"id":"panca-multipower","name":"Panca piana al multipower","muscle_group":"Petto","equipment":"Multipower","instructions":"Regola la panca sotto la barra e verifica che i fermi siano accessibili. Mantieni piedi e scapole stabili, abbassa fino a un punto confortevole sul petto e spingi senza rimbalzo.","aliases":["smith machine bench press","panca smith"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"squat-multipower","name":"Squat al multipower","muscle_group":"Gambe","equipment":"Multipower","instructions":"Posiziona i piedi in modo da trovare una traiettoria naturale sotto la barra. Scendi piegando anche e ginocchia con controllo, mantieni il bacino stabile e risali senza bloccare bruscamente le ginocchia.","aliases":["smith squat","squat smith"],"level":"Principiante","goal":"Ipertrofia","source":"marchesano"},{"id":"plank","name":"Plank frontale","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Appoggia avambracci e punte dei piedi, mantenendo gomiti sotto le spalle. Contrai addome e glutei e allinea testa, bacino e talloni; interrompi la tenuta quando la zona lombare inizia a cedere.","aliases":["plank"],"level":"Principiante","goal":"Stabilità del tronco","source":"marchesano"},{"id":"crunch","name":"Crunch a terra","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Sdraiati con ginocchia piegate e mani leggere ai lati della testa o sul petto. Solleva le scapole avvicinando le costole al bacino, espira durante la salita e torna lentamente senza tirare il collo.","aliases":["crunch addominali"],"level":"Principiante","goal":"Controllo addominale","source":"marchesano"},{"id":"sollevamento-gambe","name":"Sollevamento gambe da sdraiato","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Sdraiati e stabilizza la zona lombare contro il pavimento. Solleva le gambe senza slancio e abbassale solo fin dove riesci a mantenere il bacino controllato; piega le ginocchia per semplificare.","aliases":["leg raise"],"level":"Intermedio","goal":"Controllo addominale","source":"marchesano"},{"id":"dead-bug","name":"Dead bug","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Sdraiati con braccia verso l’alto e anche e ginocchia a 90 gradi. Allunga lentamente braccio e gamba opposti mantenendo la zona lombare stabile, poi alterna senza accelerare.","aliases":["dead bug"],"level":"Principiante","goal":"Stabilità del tronco","source":"marchesano"},{"id":"pallof-press","name":"Pallof press ai cavi","muscle_group":"Addome","equipment":"Cavi","instructions":"Posizionati di lato rispetto alla carrucola e porta la maniglia al petto. Estendi le braccia davanti a te senza ruotare il busto, mantieni la posizione e ritorna controllando la trazione laterale.","aliases":["pallof press"],"level":"Principiante","goal":"Anti-rotazione","source":"marchesano"},{"id":"ab-wheel","name":"Ruota addominale","muscle_group":"Addome","equipment":"Ruota addominale","instructions":"Parti in ginocchio con addome contratto e bacino controllato. Fai scorrere la ruota in avanti solo finché riesci a evitare l’inarcamento lombare, poi torna indietro usando il tronco e non uno strappo delle braccia.","aliases":["ab wheel","rollout"],"level":"Avanzato","goal":"Stabilità del tronco","source":"marchesano"},{"id":"side-plank","name":"Plank laterale","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Appoggia l’avambraccio sotto la spalla e impila i piedi o piega le ginocchia per facilitare. Solleva il bacino mantenendo il corpo allineato e respira regolarmente senza ruotare il torace.","aliases":["side plank"],"level":"Principiante","goal":"Stabilità laterale","source":"marchesano"},{"id":"reverse-crunch","name":"Crunch inverso","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Sdraiati con ginocchia piegate e addome attivo. Avvicina il bacino al torace sollevando leggermente il sacro, senza slanciare le gambe; torna a terra lentamente.","aliases":["reverse crunch"],"level":"Intermedio","goal":"Controllo addominale","source":"marchesano"},{"id":"croci-cavo-alto-monolaterali","name":"Croci al cavo alto monolaterali","muscle_group":"Petto","equipment":"Cavi","instructions":"Regola la carrucola in alto e afferra la maniglia con una mano. Porta il braccio in diagonale davanti al torace mantenendo il gomito morbido e il busto fermo; torna lentamente alla posizione iniziale. Completa tutte le ripetizioni da un lato e poi cambia lato.","aliases":["croci al cavo alto monolaterale","croci cavo alto singolo braccio","single arm high cable fly"],"level":"Intermedio","goal":"Ipertrofia","source":"marchesano"},{"id":"alzate-laterali-pendolo-seduto","name":"Alzate laterali seduto a busto inclinato","muscle_group":"Spalle","equipment":"Manubri","instructions":"Siediti sul bordo della panca e inclina il busto in avanti mantenendo la schiena stabile. Con i gomiti leggermente piegati, solleva i manubri lateralmente fino a una linea confortevole, senza slancio; abbassa con controllo. Questa variante enfatizza il deltoide posteriore e laterale secondo la traiettoria scelta.","aliases":["alzate laterali a pendolo seduto","alzate a pendolo","seated leaning lateral raise"],"level":"Intermedio","goal":"Ipertrofia spalle","source":"marchesano"},{"id":"french-press-bilanciere-panca-piana","name":"French press con bilanciere su panca piana","muscle_group":"Tricipiti","equipment":"Bilanciere EZ","instructions":"Sdraiati sulla panca e porta il bilanciere sopra le spalle. Flettendo soprattutto i gomiti, abbassa il bilanciere verso la fronte o appena dietro la testa senza allargare eccessivamente i gomiti; estendi le braccia senza muovere le spalle. Usa un carico gestibile e interrompi se senti dolore al gomito.","aliases":["french press panca piana bilanciere","skull crusher","lying triceps extension","french press bilanciere"],"level":"Intermedio","goal":"Ipertrofia tricipiti","source":"marchesano"},{"id":"pushdown-corda-panca-inclinata","name":"Push-down con corda su panca inclinata","muscle_group":"Tricipiti","equipment":"Cavi, panca inclinata","instructions":"Imposta la panca inclinata davanti alla carrucola e mantieni il busto appoggiato e stabile. Con i gomiti vicini al corpo, spingi la corda verso il basso fino a estendere le braccia senza inarcare la schiena; ritorna lentamente mantenendo la tensione sui tricipiti.","aliases":["pushdown con corda su panca inclinata","pressdown panca inclinata corda","incline bench rope pushdown"],"level":"Intermedio","goal":"Ipertrofia tricipiti","source":"marchesano"},{"id":"leg-extension-unilaterale","name":"Leg extension a una gamba","muscle_group":"Gambe","equipment":"Macchina","instructions":"Regola sedile e rullo in modo che il ginocchio sia allineato al perno della macchina. Estendi una gamba senza slanciare, fermati brevemente in alto e abbassa lentamente. Mantieni il bacino appoggiato e completa il lavoro su entrambi i lati con carico controllato.","aliases":["leg extension ad una gamba","leg extension singola","single leg extension"],"level":"Principiante","goal":"Ipertrofia quadricipiti","source":"marchesano"},{"id":"calf-raise-bilanciere-rialzo","name":"Calf raise in piedi con bilanciere su rialzo","muscle_group":"Polpacci","equipment":"Bilanciere, rialzo","instructions":"Appoggia l'avampiede su un rialzo stabile e posiziona il bilanciere in modo sicuro sulle spalle. Scendi lentamente con i talloni fino a un allungamento controllato, poi sollevati sulle punte senza rimbalzare. Usa un appoggio per l'equilibrio e non forzare la caviglia.","aliases":["calf in piedi su rialzo bilanciere","calf raise bilanciere","standing barbell calf raise"],"level":"Intermedio","goal":"Ipertrofia polpacci","source":"marchesano"},{"id":"curl-zottman","name":"Curl Zottman con manubri","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"In piedi, esegui il curl con i palmi rivolti in avanti durante la salita. In alto ruota gli avambracci portando i palmi verso il basso, quindi abbassa lentamente con presa prona. Mantieni i gomiti vicini al busto e non usare slancio.","aliases":["zottman curl","curl zottman","zottman","zottman dumbbell curl"],"level":"Intermedio","goal":"Bicipiti e avambracci","source":"marchesano"},{"id":"curl-cavo-basso-corda","name":"Curl al cavo basso con corda","muscle_group":"Bicipiti","equipment":"Cavi, corda","instructions":"Collega la corda alla carrucola bassa e afferrane le estremità con i palmi rivolti uno verso l'altro. Fletti i gomiti mantenendo le spalle ferme e il busto stabile; abbassa lentamente senza lasciar trascinare le braccia dal cavo.","aliases":["curl al cavo basso con corda","curl corda cavo basso","rope cable curl"],"level":"Principiante","goal":"Ipertrofia bicipiti","source":"marchesano"},{"id":"preacher-curl-cavo-unilaterale","name":"Curl unilaterale su panca Scott al cavo basso","muscle_group":"Bicipiti","equipment":"Cavi, panca Scott","instructions":"Posiziona il braccio sul supporto della panca Scott e impugna la maniglia collegata al cavo basso. Fletti il gomito senza sollevare la spalla, fermati brevemente in contrazione e distendi con controllo senza bloccare bruscamente l'articolazione. Ripeti dall'altro lato.","aliases":["preacher curl monolaterale su panca al cavo basso","curl scott al cavo singolo","single arm cable preacher curl"],"level":"Intermedio","goal":"Ipertrofia bicipiti","source":"marchesano"},{"id":"crunch-cavo-alto","name":"Crunch al cavo alto","muscle_group":"Addome","equipment":"Cavi, corda","instructions":"Collega una corda alla carrucola alta e inginocchiati a distanza sufficiente. Mantieni il bacino fermo e avvicina le costole al bacino flettendo il tronco, senza tirare con le braccia né sederti sui talloni. Ritorna lentamente mantenendo la tensione addominale.","aliases":["crunch al cavo alto","cable crunch","crunch ai cavi in ginocchio"],"level":"Intermedio","goal":"Ipertrofia addominali","source":"marchesano"},{"id":"v-situp-panca","name":"V sit-up su panca","muscle_group":"Addome","equipment":"Panca","instructions":"Siediti su una panca stabile e inclina leggermente il busto tenendo le mani ai lati per sostenerti se necessario. Porta le ginocchia verso il torace mentre avvicini il busto alle cosce, poi distendi gambe e tronco senza perdere il controllo. Riduci l'ampiezza se la zona lombare si inarca o dà fastidio.","aliases":["v sit-up su panca","v sit up","v-up panca","bench v sit up"],"level":"Intermedio","goal":"Controllo addominale","source":"marchesano"},{"id":"lat-machine-dietro-nuca","name":"Lat machine dietro la nuca (variante sconsigliata)","muscle_group":"Schiena","equipment":"Lat machine","instructions":"Questa variante porta la barra dietro la testa e richiede mobilità e controllo delle spalle elevati; per molte persone è più confortevole e gestibile la lat machine davanti al petto. Se non hai indicazioni tecniche specifiche, scegli la presa davanti. Non forzare la posizione e interrompi in caso di fastidio a spalle o collo.","aliases":["lat machine dietro","lat machine dietro la nuca","behind neck lat pulldown"],"level":"Avanzato","goal":"Schiena · variante tecnica","source":"marchesano"}];



function message(id, text, error = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = text || '';
  el.style.color = error ? '#ff7773' : '';
}
const REMEMBERED_EMAIL_KEY = 'marchesano-gym-remembered-email';
function loadRememberedEmail() {
  try {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
    $('email').value = remembered;
    $('rememberEmail').checked = Boolean(remembered);
  } catch (_) {}
}
function saveRememberedEmail(email) {
  try {
    if ($('rememberEmail').checked) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch (_) {}
}
function showAuth() {
  $('authView').classList.remove('hidden');
  $('dashboardView').classList.add('hidden');
  $('toolDialog').classList.add('hidden');
  $('bottomNav').classList.add('hidden');
  $('accountBtn').classList.add('hidden'); $('accountMenu').classList.add('hidden');
  activePage = 'home';
}
function showDashboard() {
  $('authView').classList.add('hidden');
  $('toolDialog').classList.add('hidden');
  $('dashboardView').classList.remove('hidden');
  $('bottomNav').classList.remove('hidden');
  $('accountBtn').classList.remove('hidden'); $('accountEmail').textContent = currentUser?.email || 'Account personale';
  activePage = 'home';
  document.querySelectorAll('#bottomNav [data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === 'home'));
  $('todayLabel').textContent = new Intl.DateTimeFormat('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date());
  document.documentElement.style.scrollBehavior = 'auto';
  requestAnimationFrame(() => window.scrollTo({top:0,left:0,behavior:'auto'}));
}
function setAuthMode() {
  $('authTitle').textContent = isRegister ? 'Crea il tuo account' : 'Bentornato';
  $('authSubtitle').textContent = isRegister ? 'Un account personale per i tuoi allenamenti.' : 'Accedi per continuare il tuo percorso.';
  $('authSubmit').innerHTML = isRegister ? 'Registrati <span>→</span>' : 'Accedi <span>→</span>';
  $('toggleAuth').textContent = isRegister ? 'Hai già un account? Accedi' : 'Non hai ancora un account? Registrati';
  $('password').autocomplete = isRegister ? 'new-password' : 'current-password';
}
$('toggleAuth').addEventListener('click', () => { isRegister = !isRegister; message('authMessage',''); setAuthMode(); });
$('rememberEmail').addEventListener('change', () => {
  if ($('rememberEmail').checked) saveRememberedEmail($('email').value);
  else { try { localStorage.removeItem(REMEMBERED_EMAIL_KEY); } catch (_) {} }
});
$('email').addEventListener('change', () => {
  if ($('rememberEmail').checked) saveRememberedEmail($('email').value);
});
loadRememberedEmail();
$('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('email').value.trim();
  const password = $('password').value;
  $('authSubmit').disabled = true;
  message('authMessage', isRegister ? 'Creazione account…' : 'Accesso in corso…');
  try {
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) {
        message('authMessage', 'Account creato. Controlla la tua email per confermare la registrazione.');
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    saveRememberedEmail(email);
    message('authMessage','');
    await loadApp();
  } catch (err) {
    message('authMessage', err.message || 'Operazione non riuscita.', true);
  } finally {
    $('authSubmit').disabled = false;
  }
});
$('accountBtn').addEventListener('click', () => {
  const menu = $('accountMenu');
  const willOpen = menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !willOpen);
  $('accountBtn').setAttribute('aria-expanded', String(willOpen));
  $('accountEmail').textContent = currentUser?.email || 'Account personale';
});
$('accountLogoutBtn').addEventListener('click', async () => {
  $('accountMenu').classList.add('hidden');
  await supabase.auth.signOut(); currentUser = null; showAuth();
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.account-area')) { $('accountMenu').classList.add('hidden'); $('accountBtn').setAttribute('aria-expanded','false'); }
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { $('accountMenu').classList.add('hidden'); $('accountBtn').setAttribute('aria-expanded','false'); } });
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user ?? null;
  if (currentUser) { showDashboard(); setTimeout(loadDashboardData, 0); } else showAuth();
});

async function loadApp() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  if (user) { showDashboard(); await loadDashboardData(); } else showAuth();
}
async function loadDashboardData() {
  if (!currentUser) return;
  const [plansRes, sessionsRes, metricsRes] = await Promise.all([
    supabase.from('workout_plans').select('id,name,description,color,created_at').eq('user_id', currentUser.id).eq('is_archived', false).order('created_at', { ascending:false }),
    supabase.from('workout_sessions').select('id,status').eq('user_id', currentUser.id).eq('status','completed'),
    supabase.from('body_metrics').select('weight_kg,measured_at').eq('user_id', currentUser.id).not('weight_kg','is',null).order('measured_at',{ascending:false}).limit(1)
  ]);
  const error = plansRes.error || sessionsRes.error || metricsRes.error;
  if (error) message('dashboardMessage', `Database: ${error.message}`, true);
  plans = plansRes.data || [];
  $('plansCount').textContent = plans.length;
  $('sessionsCount').textContent = sessionsRes.data?.length ?? '—';
  $('bodyWeight').textContent = metricsRes.data?.[0]?.weight_kg ? `${metricsRes.data[0].weight_kg} kg` : '—';
  renderPlans();
}
function renderPlans() {
  if (!$('plansList') || !$('emptyPlans')) return;
  $('plansList').innerHTML = '';
  $('emptyPlans').classList.toggle('hidden', plans.length > 0);
  plans.forEach(plan => {
    const card = document.createElement('article');
    card.className = 'plan-card';
    card.style.setProperty('--plan-color', plan.color || '#FF3038');
    const h = document.createElement('h3'); h.textContent = plan.name;
    const p = document.createElement('p'); p.textContent = plan.description || 'Scheda personale pronta per essere organizzata.';
    const meta = document.createElement('div'); meta.className = 'plan-meta';
    const label = document.createElement('span'); label.textContent = 'SCHEDA PERSONALE';
    const open = document.createElement('button'); open.type = 'button'; open.textContent = 'Dettagli →';
    open.addEventListener('click', () => openPlanDetails(plan));
    meta.append(label, open); card.append(h,p,meta); $('plansList').append(card);
  });
}
function openPlanDialog() {
  $('planMessage').textContent = '';
  $('planForm').reset();
  $('planDialog').showModal();
}
$('addPlanBtn')?.addEventListener('click', openPlanDialog);
$('emptyAddPlanBtn')?.addEventListener('click', openPlanDialog);
$('startWorkoutBtn').addEventListener('click', () => openWorkoutChooser());
$('closePlanDialog').addEventListener('click', () => $('planDialog').close());
$('planForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const name = $('planName').value.trim();
  if (!name) return;
  const { data, error } = await supabase.from('workout_plans').insert({
    user_id: currentUser.id,
    name,
    description: $('planDescription').value.trim() || null,
    color: $('planColor').value
  }).select().single();
  if (error) { message('planMessage', error.message, true); return; }
  $('planDialog').close();
  message('dashboardMessage', 'Scheda salvata correttamente.');
  await loadDashboardData();
});
function openPlanDetails(plan) {
  if (!plan) return;
  activePlanForExercise = plan;
  toolBackAction = () => openPlansView();
  $('toolTitle').textContent = plan.name;
  $('toolContent').innerHTML = `<div class="page-intro"><p>${escapeHtml(plan.description || 'La tua scheda personale')}</p><span class="pill">${escapeHtml(plan.color || '#ff3038') === '#ff3038' ? 'SCHEDA PERSONALE' : 'PROGRAMMA PERSONALE'}</span></div>
    <div class="plan-action-row"><button id="startThisPlan" class="primary-button start-plan-button" type="button"><span class="button-icon">${DUMBBELL_ICON}</span> Inizia allenamento</button><button id="planAddExercise" class="secondary-button" type="button">＋ Aggiungi esercizi</button></div>
    <div class="plan-danger-row"><button id="deleteThisPlan" class="danger-text-button" type="button">${TRASH_ICON}<span>Elimina questa scheda</span></button></div>
    <div class="section-heading page-section-heading"><div><p class="eyebrow">PROGRAMMA</p><h2>Esercizi della scheda</h2></div></div>
    <div class="plan-exercises" id="planExerciseList"><p class="muted">Caricamento esercizi della scheda…</p></div>`;
  showToolPage('plans');
  $('planAddExercise').addEventListener('click', () => openExerciseLibrary(plan));
  $('startThisPlan').addEventListener('click', () => startGuidedWorkout(plan));
  $('deleteThisPlan').addEventListener('click', () => deleteWorkoutPlan(plan));
  loadPlanExercises(plan);
}
$('closeToolDialog').addEventListener('click', () => {
  if (typeof toolBackAction === 'function') toolBackAction(); else showDashboard();
});
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function showToolPage(nav='home') {
  activePage = nav;
  $('authView').classList.add('hidden');
  $('dashboardView').classList.add('hidden');
  $('toolDialog').classList.remove('hidden');
  $('bottomNav').classList.remove('hidden');
  $('accountBtn').classList.remove('hidden'); $('accountEmail').textContent = currentUser?.email || 'Account personale';
  document.querySelectorAll('#bottomNav [data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === nav));
  window.scrollTo({top:0,left:0,behavior:'auto'});
}
function openTool(tool, customContent = null) {
  if (tool === 'Libreria esercizi' && !customContent) { openExerciseLibrary(); return; }
  const t = String(tool).toLocaleLowerCase('it');
  const nav = t.includes('schede') || t.includes('scheda') ? 'plans' : t.includes('diario') || t.includes('storico') ? 'history' : t.includes('allenamento') || t.includes('workout') ? 'workout' : t.includes('esercizi') ? 'exercises' : t.includes('profilo') || t.includes('misure') || t.includes('calendario') ? 'profile' : 'home';
  toolBackAction = () => showDashboard();
  $('toolTitle').textContent = tool;
  $('toolContent').innerHTML = customContent || '';
  if (!customContent) {
    if (tool === 'Storico allenamenti' || tool === 'Diario allenamenti') {
      renderWorkoutDiary();
    } else if (tool === 'Calendario') {
      $('toolContent').innerHTML = `<div class="page-intro"><p>Programma le prossime sessioni e tieni sotto controllo la settimana.</p></div><form id="scheduleForm" class="panel form-panel"><label>Nome allenamento<input id="scheduleTitle" required placeholder="Es. Petto / Spalle / Tricipiti"></label><label>Data e ora<input id="scheduleAt" type="datetime-local" required></label><label>Note<textarea id="scheduleNotes" rows="2"></textarea></label><button class="primary-button" type="submit">Aggiungi al calendario <span>→</span></button><p id="scheduleMessage" class="status-message"></p></form><div id="scheduleList" class="tool-list"></div>`;
      loadSchedule(); $('scheduleForm').addEventListener('submit', saveSchedule);
    } else if (tool === 'Peso e misure') {
      $('toolContent').innerHTML = `<div class="page-intro"><p>Registra il peso e le misure per seguire i tuoi progressi nel tempo.</p></div><form id="bodyForm" class="panel form-panel"><label>Data<input id="metricDate" type="date" required></label><div class="small-form"><label>Peso (kg)<input id="metricWeight" type="number" step="0.1" min="1" placeholder="74.0"></label><label>Grasso (%)<input id="metricFat" type="number" step="0.1" min="0" max="100" placeholder="Facoltativo"></label></div><div class="small-form"><label>Torace (cm)<input id="metricChest" type="number" step="0.1" min="1"></label><label>Vita (cm)<input id="metricWaist" type="number" step="0.1" min="1"></label></div><div class="small-form"><label>Fianchi (cm)<input id="metricHips" type="number" step="0.1" min="1"></label><label>Braccio (cm)<input id="metricArm" type="number" step="0.1" min="1"></label></div><label>Coscia (cm)<input id="metricThigh" type="number" step="0.1" min="1"></label><label>Note<textarea id="metricNotes" rows="2"></textarea></label><button class="primary-button" type="submit">Salva misurazione <span>→</span></button><p id="metricMessage" class="status-message"></p></form><h2 class="subsection-title">Misurazioni precedenti</h2><div id="metricList" class="tool-list"></div>`;
      $('metricDate').value = new Date().toISOString().slice(0,10); loadMetrics(); $('bodyForm').addEventListener('submit', saveMetric);
    } else if (tool === 'Workout guidato') {
      $('toolContent').innerHTML = `<div class="page-intro"><p>Scegli una scheda per vedere gli esercizi e preparare la sessione.</p></div><div class="plans-grid">${plans.length ? plans.map(p=>`<article class="plan-card"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || 'Scheda personale')}</p><button class="primary-button compact" type="button" data-plan="${p.id}">Apri scheda →</button></article>`).join('') : '<div class="empty-state"><h3>Non hai ancora schede</h3><p>Crea una scheda per iniziare.</p><button id="workoutCreatePlan" class="primary-button">＋ Crea scheda</button></div>'}</div>`;
      $('toolContent').querySelectorAll('[data-plan]').forEach(btn => btn.addEventListener('click', () => openPlanDetails(plans.find(p=>p.id===btn.dataset.plan))));
      $('workoutCreatePlan')?.addEventListener('click', openPlanDialog);
    } else {
      $('toolContent').innerHTML = '<div class="notice">Sezione personale.</div>';
    }
  }
  showToolPage(nav);
}

let activeWorkout = null;
let workoutTimerInterval = null;
let workoutTimerRemaining = 0;
function openWorkoutChooser(){
  if(!plans.length){openPlanDialog();return;}
  toolBackAction=()=>showDashboard();
  openTool('Allenamento', `<div class="workout-intro"><p class="eyebrow">SESSIONE GUIDATA</p><h2>Quale scheda alleni oggi?</h2><p>Scegli una scheda per iniziare. Potrai registrare carichi e ripetizioni per ogni serie e usare il recupero integrato.</p></div><div class="plans-grid workout-plan-grid">${plans.map(p=>`<article class="plan-card"><div class="plan-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"></path><path d="M9 5v14"></path></svg></div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||'Scheda personale')}</p><button class="primary-button compact" type="button" data-start-plan="${p.id}">Inizia sessione →</button></article>`).join('')}</div>`);
  $('toolContent').querySelectorAll('[data-start-plan]').forEach(b=>b.addEventListener('click',()=>startGuidedWorkout(plans.find(p=>p.id===b.dataset.startPlan))));
}
async function startGuidedWorkout(plan){
  if(!plan||!currentUser)return;
  // Carica il catalogo con immagini, quando disponibile, anche se la sessione parte
  // direttamente da una scheda e la libreria non è stata aperta in precedenza.
  if(!onlineCatalogLoaded && !onlineCatalogLoading) await loadOnlineExerciseCatalog(true);
  const {data:rows,error}=await supabase.from('plan_exercises').select('*').eq('user_id',currentUser.id).eq('plan_id',plan.id).order('sort_order');
  if(error){openTool('Allenamento',`<p class="status-message">Non riesco a caricare la scheda: ${escapeHtml(error.message)}</p>`);return;}
  if(!rows?.length){openPlanDetails(plan);message('catalogMessage','Aggiungi almeno un esercizio alla scheda prima di iniziare.',true);return;}
  const ids=rows.map(r=>r.exercise_id).filter(Boolean);
  const {data:exercises,error:exErr}=await supabase.from('exercises').select('*').eq('user_id',currentUser.id).in('id',ids);
  if(exErr){openTool('Allenamento',`<p class="status-message">Non riesco a caricare gli esercizi: ${escapeHtml(exErr.message)}</p>`);return;}
  const map=new Map((exercises||[]).map(x=>[x.id,x]));
  const normalizeExerciseKey = value => String(value||'').toLocaleLowerCase('it')
    .normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ').trim();
  const findCatalogMatch = exercise => {
    const nameKey = normalizeExerciseKey(exercise?.name);
    let match = EXERCISE_CATALOG.find(item => normalizeExerciseKey(item.name) === nameKey);
    if (match) return match;
    // Alias mirati per nomi italiani salvati in schede create prima dell'aggiornamento.
    const aliases = [
      { test: /90 90.*(flessore|femorali|coscia)/, catalog: /90 90.*(femorali|mobilita|hamstring)/ },
      { test: /abbraccia.*ginocchia.*petto/, catalog: /(ginocchia.*petto|knee.*chest|hug.*knees)/ },
      { test: /addu(ttore|zione).*coscia/, catalog: /(addu(ttore|zione).*coscia|adductor machine)/ },
      { test: /abdu(ttore|zione).*coscia/, catalog: /(abdu(ttore|zione).*coscia|abductor machine)/ }
    ];
    for (const alias of aliases) {
      if (alias.test.test(nameKey)) {
        match = EXERCISE_CATALOG.find(item => alias.catalog.test(normalizeExerciseKey(item.name)) && item.image);
        if (match) return match;
      }
    }
    return null;
  };
  const items=rows.map(r=>{
    const exercise=map.get(r.exercise_id);
    if(!exercise)return null;
    const catalogMatch=findCatalogMatch(exercise);
    const image=exercise.image_url || exercise.image || catalogMatch?.image_url || catalogMatch?.image || null;
    return {...r,exercise:{...exercise,image,image_url:image}};
  }).filter(Boolean);
  // Aggiorna in background gli URL recuperati dal catalogo, così saranno disponibili
  // anche alle prossime sessioni. Un errore di aggiornamento non blocca l'allenamento.
  for (const item of items) {
    const ex=item.exercise;
    if (ex.image_url && !map.get(ex.id)?.image_url) {
      supabase.from('exercises').update({image_url:ex.image_url})
        .eq('id',ex.id).eq('user_id',currentUser.id).then(()=>{}).catch(()=>{});
    }
  }
  if(!items.length){openPlanDetails(plan);return;}
  activeWorkout={plan,items,startedAt:new Date(),sets:items.map((it)=>Array.from({length:Math.max(1,Math.min(12,Number(it.sets)||3))},(_,i)=>({set_number:i+1,reps:Number(it.reps)||10,weight_kg:0,completed:false}))),sessionId:null};
  if(workoutTimerInterval){clearInterval(workoutTimerInterval);workoutTimerInterval=null;}
  toolBackAction=()=>openPlansView();
  renderGuidedWorkout();
}
function renderGuidedWorkout(){
  if(!activeWorkout)return;
  const w=activeWorkout;
  $('toolTitle').textContent='Allenamento in corso';
  $('toolContent').innerHTML=`<section class="active-workout-header"><div><p class="eyebrow">SESSIONE ATTIVA</p><h2>${escapeHtml(w.plan.name)}</h2><p class="muted">${w.items.length} esercizi · modifica carichi e ripetizioni mentre ti alleni</p></div><div class="live-pill"><i></i> IN CORSO</div></section><div class="workout-toolbar"><label>Recupero predefinito (sec)<input id="workoutRestDefault" type="number" min="0" max="600" step="5" value="90"></label><div class="rest-clock" id="restClock"><span>RECUPERO</span><strong id="restTime">01:30</strong><button id="timerToggle" class="secondary-button" type="button">▶ Avvia timer</button><button id="timerReset" class="text-button" type="button">Azzera</button></div></div><div class="guided-exercise-list">${w.items.map((it,i)=>{const x=it.exercise;return `<article class="guided-exercise" data-ex-index="${i}"><div class="guided-exercise-top"><div class="guided-exercise-art">${exerciseVisual(x)}</div><div class="guided-exercise-info"><span class="exercise-number">ESERCIZIO ${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.muscle_group||'Altro')} · ${escapeHtml(x.equipment||'Attrezzatura varia')}</p><details><summary>Come si esegue</summary><p>${escapeHtml(exerciseGuide(x))}</p></details></div></div><div class="sets-table-wrap"><table class="sets-table"><thead><tr><th>Serie</th><th>Kg</th><th>Rip.</th><th>Fatta</th></tr></thead><tbody>${w.sets[i].map((set,j)=>`<tr data-set-row="${j}"><td>${j+1}</td><td><input aria-label="Chili serie ${j+1}" data-field="weight_kg" type="number" min="0" max="1000" step="0.5" value="${set.weight_kg}" inputmode="decimal"></td><td><input aria-label="Ripetizioni serie ${j+1}" data-field="reps" type="number" min="1" max="200" step="1" value="${set.reps}" inputmode="numeric"></td><td><button class="set-done ${set.completed?'is-done':''}" data-complete-set="${j}" type="button" aria-label="Segna serie ${j+1} completata">${set.completed?'✓':'○'}</button></td></tr>`).join('')}</tbody></table></div><div class="exercise-set-footer"><button class="secondary-button add-set-btn" data-add-set="${i}" type="button">＋ Aggiungi serie</button><span class="set-progress">${w.sets[i].filter(s=>s.completed).length}/${w.sets[i].length} serie completate</span></div></article>`}).join('')}</div><div class="finish-workout-panel"><div><p class="eyebrow">OTTIMO LAVORO</p><h3>Hai finito la sessione?</h3><p>Salveremo durata, serie, ripetizioni e carichi registrati.</p></div><button id="finishWorkoutBtn" class="primary-button finish-workout-button" type="button">✓ Completa allenamento</button><button id="cancelWorkoutBtn" class="secondary-button" type="button">Esci senza completare</button><p id="workoutSaveMessage" class="status-message"></p></div>`;
  showToolPage('workout');
  $('toolContent').querySelectorAll('[data-ex-index]').forEach(card=>{const i=Number(card.dataset.exIndex);card.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',()=>{const j=Number(input.closest('[data-set-row]').dataset.setRow);activeWorkout.sets[i][j][input.dataset.field]=Number(input.value)||0;}));card.querySelectorAll('[data-complete-set]').forEach(btn=>btn.addEventListener('click',()=>{const j=Number(btn.dataset.completeSet);const set=activeWorkout.sets[i][j];set.completed=!set.completed;const val=Number($('workoutRestDefault').value)||90;if(set.completed&&val>0)startRestTimer(val);renderGuidedWorkoutPreserveScroll();}));});
  $('toolContent').querySelectorAll('[data-add-set]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.addSet);if(activeWorkout.sets[i].length>=20)return;activeWorkout.sets[i].push({set_number:activeWorkout.sets[i].length+1,reps:10,weight_kg:0,completed:false});renderGuidedWorkoutPreserveScroll();}));
  $('timerToggle').addEventListener('click',()=>{if(workoutTimerInterval){clearInterval(workoutTimerInterval);workoutTimerInterval=null;$('timerToggle').textContent='▶ Riprendi timer';}else startRestTimer(workoutTimerRemaining||Number($('workoutRestDefault').value)||90);});
  $('timerReset').addEventListener('click',()=>{if(workoutTimerInterval)clearInterval(workoutTimerInterval);workoutTimerInterval=null;workoutTimerRemaining=Number($('workoutRestDefault').value)||90;updateRestClock();});
  $('finishWorkoutBtn').addEventListener('click',finishGuidedWorkout);
  $('cancelWorkoutBtn').addEventListener('click',()=>{if(confirm('Uscire senza salvare questa sessione?')){if(workoutTimerInterval)clearInterval(workoutTimerInterval);workoutTimerInterval=null;activeWorkout=null;openWorkoutChooser();}});
  workoutTimerRemaining=Number($('workoutRestDefault').value)||90;updateRestClock();
}
function renderGuidedWorkoutPreserveScroll(){const y=window.scrollY;renderGuidedWorkout();requestAnimationFrame(()=>window.scrollTo(0,y));}
function startRestTimer(seconds){if(workoutTimerInterval)clearInterval(workoutTimerInterval);workoutTimerRemaining=Math.max(0,Number(seconds)||0);updateRestClock();$('timerToggle').textContent='Ⅱ Pausa timer';if(workoutTimerRemaining<=0)return;workoutTimerInterval=setInterval(()=>{workoutTimerRemaining=Math.max(0,workoutTimerRemaining-1);updateRestClock();if(workoutTimerRemaining<=0){clearInterval(workoutTimerInterval);workoutTimerInterval=null;const clock=$('restClock');if(clock){clock.classList.add('timer-finished');$('timerToggle').textContent='↻ Riavvia timer';if(navigator.vibrate)navigator.vibrate([150,80,150]);}}},1000);}
function updateRestClock(){const el=$('restTime');if(el)el.textContent=`${String(Math.floor(workoutTimerRemaining/60)).padStart(2,'0')}:${String(workoutTimerRemaining%60).padStart(2,'0')}`;const clock=$('restClock');if(clock&&workoutTimerRemaining>0)clock.classList.remove('timer-finished');}
async function finishGuidedWorkout(){
  const w=activeWorkout;if(!w||!currentUser)return;
  const btn=$('finishWorkoutBtn');btn.disabled=true;btn.textContent='Salvataggio…';message('workoutSaveMessage','Salvo la sessione e le serie…');
  const endedAt=new Date();const duration=Math.max(0,Math.round((endedAt-w.startedAt)/1000));
  try{
    const {data:session,error:sessionErr}=await supabase.from('workout_sessions').insert({user_id:currentUser.id,plan_id:w.plan.id,plan_name:w.plan.name,started_at:w.startedAt.toISOString(),finished_at:endedAt.toISOString(),duration_seconds:duration,status:'completed'}).select().single();
    if(sessionErr)throw new Error('Sessione non salvata: '+sessionErr.message);
    for(let i=0;i<w.items.length;i++){
      const item=w.items[i];
      const {data:sessionExercise,error:seErr}=await supabase.from('session_exercises').insert({user_id:currentUser.id,session_id:session.id,exercise_id:item.exercise.id,exercise_name:item.exercise.name,position:i+1,rest_seconds:Number(item.rest_seconds)||90}).select().single();
      if(seErr)throw new Error('Sessione creata, ma non riesco a salvare gli esercizi: '+seErr.message);
      const payload=w.sets[i].map((set,j)=>({user_id:currentUser.id,session_exercise_id:sessionExercise.id,set_number:j+1,reps:set.reps,weight_kg:set.weight_kg,completed:set.completed}));
      const {error:setErr}=await supabase.from('workout_sets').insert(payload);
      if(setErr)throw new Error('Sessione creata, ma non riesco a salvare le serie: '+setErr.message);
    }
    if(workoutTimerInterval)clearInterval(workoutTimerInterval);workoutTimerInterval=null;activeWorkout=null;
    $('toolTitle').textContent='Allenamento completato';$('toolContent').innerHTML=`<section class="workout-complete"><div class="complete-check">✓</div><p class="eyebrow">SESSIONE SALVATA</p><h2>Allenamento completato.</h2><p>${escapeHtml(w.plan.name)} · ${Math.floor(duration/60)} min ${duration%60} sec</p><div class="complete-stats"><div><strong>${w.items.length}</strong><span>Esercizi</span></div><div><strong>${w.sets.reduce((n,sets)=>n+sets.filter(s=>s.completed).length,0)}</strong><span>Serie completate</span></div><div><strong>${w.sets.reduce((n,sets)=>n+sets.filter(s=>s.completed).reduce((t,s)=>t+(Number(s.weight_kg)||0)*(Number(s.reps)||0),0),0).toLocaleString('it-IT')}</strong><span>Volume indicativo kg×rip.</span></div></div><button id="backHomeAfterWorkout" class="primary-button" type="button">Torna alla Home →</button><button id="viewHistoryAfterWorkout" class="secondary-button" type="button">Vai allo storico</button></section>`;
    $('backHomeAfterWorkout').addEventListener('click',async()=>{await loadDashboardData();showDashboard();});$('viewHistoryAfterWorkout').addEventListener('click',()=>openTool('Diario allenamenti'));await loadDashboardData();
  }catch(err){message('workoutSaveMessage',err.message||'Errore durante il salvataggio.',true);btn.disabled=false;btn.textContent='Riprova salvataggio';}
}

let activePlanForExercise = null;
let exerciseTab = 'catalog';
const MUSCLE_ICONS = {Petto:'🏋️',Schiena:'🧗',Spalle:'💪',Bicipiti:'💪',Tricipiti:'💪',Gambe:'🦵',Glutei:'🏃',Polpacci:'🦵',Addome:'🎯',Cardio:'❤️',Avambracci:'✊',Altro:'🏋️'};
const MUSCLE_DESCRIPTIONS = {Petto:'Pettorale maggiore e minore; coinvolgimento di tricipiti e deltoide anteriore secondo il movimento.',Schiena:'Gran dorsale, romboidi e trapezio; gli erettori spinali intervengono negli esercizi di estensione e stabilizzazione.',Spalle:'Deltoide anteriore, laterale e posteriore; il coinvolgimento cambia in base alla traiettoria.',Bicipiti:'Bicipite brachiale, brachiale e brachioradiale, secondo la presa.',Tricipiti:'Tricipite brachiale, responsabile dell’estensione del gomito.',Gambe:'Quadricipiti e/o femorali; glutei e adduttori collaborano in base al gesto.',Glutei:'Grande, medio e piccolo gluteo; possono collaborare femorali e muscoli del tronco.',Polpacci:'Gastrocnemio e soleo, responsabili della flessione plantare della caviglia.',Addome:'Retto addominale, obliqui e muscoli profondi di stabilizzazione del tronco.',Cardio:'Sistema cardiovascolare e resistenza generale; il coinvolgimento muscolare varia con l’attività.'};
function exerciseGuide(item) {
  if (item.instructions && item.instructions.length > 75 && !item.instructions.startsWith('Esegui il movimento con controllo')) return item.instructions;
  const n = item.name.toLocaleLowerCase('it');
  if (/panca|chest press|floor press|distensioni da terra|spinta al petto|piegamenti|push-up|dip|svend press/.test(n)) return 'Stabilizza i piedi e il tronco, mantieni le scapole controllate sulla panca e abbassa il carico verso il petto con un movimento fluido. Spingi senza rimbalzi e senza forzare l’estensione dei gomiti. Usa un carico gestibile e, con il bilanciere, un supporto di sicurezza o uno spotter.';
  if (/croci|pec deck|butterfly/.test(n)) return 'Mantieni una lieve flessione dei gomiti e il petto aperto. Avvicina le braccia davanti al torace senza trasformare il gesto in una spinta; ritorna lentamente fino a una tensione confortevole, senza allungare eccessivamente la spalla.';
  if (/lat machine|trazioni|pulldown|trazione ai cavi a braccia tese/.test(n)) return 'Parti con il busto stabile e le spalle lontane dalle orecchie. Porta i gomiti verso il basso e tira la barra davanti al corpo, senza slanciarti né tirare dietro la nuca. Ritorna lentamente controllando la risalita.';
  if (/rematore|pulley|t-bar/.test(n)) return 'Mantieni la colonna in posizione neutra e il tronco fermo. Tira i gomiti verso il fianco o dietro il busto, avvicinando le scapole senza strappare. Rilascia il carico lentamente, evitando di incurvare la schiena.';
  if (/stacco|good morning|hip hinge|pull-through|back extension|iperestension/.test(n)) return 'Attiva l’addome e mantieni la schiena neutra. Porta indietro il bacino con una flessione controllata delle anche, tenendo il carico vicino al corpo. Risali spingendo il pavimento e contraendo i glutei, senza iperestendere la zona lombare.';
  if (/squat|affondi|leg press|pressa|step-up|salita su panca|pistol|wall sit|sissy|nordic|reverse nordic/.test(n)) return 'Posiziona i piedi in modo stabile e mantieni le ginocchia allineate alla direzione delle punte. Scendi con controllo nella profondità che riesci a gestire mantenendo il tronco stabile, poi risali spingendo attraverso il piede. Evita rimbalzi e dolore articolare.';
  if (/leg extension|estensioni delle gambe/.test(n)) return 'Regola la macchina affinché il perno sia allineato al ginocchio. Estendi le gambe senza slancio, contrai i quadricipiti in alto e abbassa lentamente il carico, senza lasciarlo cadere.';
  if (/leg curl|flessioni delle gambe|flessioni della gamba/.test(n)) return 'Allinea il ginocchio al perno della macchina e mantieni il bacino stabile. Fletti le ginocchia portando il rullo verso di te, contrai i femorali e ritorna lentamente senza sollevare il bacino.';
  if (/hip thrust|spinta d’anca|glute bridge|frog pump|kickback glutei|slanci posteriori per i glutei|abduzioni anca|abduzioni dell’anca/.test(n)) return 'Mantieni il tronco stabile e spingi attraverso il piede. Estendi l’anca contraendo i glutei, senza inarcare la zona lombare. Fermati brevemente in contrazione e ritorna con controllo.';
  if (/curl|chin-up/.test(n)) return 'Tieni i gomiti vicini al busto e le spalle rilassate. Fletti il gomito senza dondolare il corpo, poi abbassa il carico lentamente fino a una posizione controllata. Evita di slanciare la schiena per completare la ripetizione.';
  if (/pushdown|french press|skull crusher|estensioni sopra|kickback|panca presa stretta/.test(n)) return 'Stabilizza la parte alta del braccio e muovi principalmente l’avambraccio. Estendi il gomito in modo controllato, senza bloccarlo bruscamente; nella fase di ritorno mantieni tensione e non lasciare che le spalle prendano il sopravvento.';
  if (/shoulder press|military press|lento avanti|arnold press|push press|spinte sopra la testa|spinte per le spalle|spinte arnold/.test(n)) return 'Contrai l’addome e mantieni glutei e tronco stabili. Spingi il carico sopra la testa seguendo una traiettoria naturale, senza inarcare la zona lombare; abbassa lentamente fino alla posizione iniziale controllata.';
  if (/alzate laterali|alzate frontali|reverse fly|face pull|tirate al mento|y-raise|cuban rotation/.test(n)) return 'Usa un carico leggero o moderato e mantieni il movimento fluido. Guida il gesto con i gomiti, evita slanci e spalle sollevate verso le orecchie e torna lentamente alla posizione iniziale.';
  if (/crunch|sit-up|leg raise|knee raise|sollevamento delle gambe|sollevamento delle ginocchia|plank|dead bug|ab wheel|ruota addominale|pallof|antirotazionale|russian twist|torsioni russe|woodchopper|mountain climber/.test(n)) return 'Mantieni l’addome attivo e respira senza trattenere a lungo il fiato. Muovi il corpo con controllo, evitando di compensare con la zona lombare. Riduci l’ampiezza o scegli una variante più semplice se perdi la posizione.';
  if (/calf raise|sollevamenti sui polpacci/.test(n)) return 'Scendi lentamente fino a un allungamento confortevole del polpaccio, poi sali sulle punte senza rimbalzare. Mantieni una breve contrazione in alto e usa un appoggio per l’equilibrio se necessario.';
  if (/tapis roulant|cyclette|ellittica|vogatore|air bike|corda|ski erg|sled push|battle rope/.test(n)) return 'Inizia con intensità moderata e aumenta gradualmente in base al tuo livello. Mantieni una postura stabile, un ritmo sostenibile e una respirazione controllata. Interrompi in caso di dolore, vertigini o malessere.';
  return 'Prepara l’attrezzatura e scegli un carico che consenta di mantenere una tecnica pulita. Esegui la fase di spinta o trazione con controllo, torna lentamente alla posizione iniziale e interrompi la serie se perdi la postura o senti dolore.';
}

const EXERCISE_NAME_IT = {
  'chest press macchina':'Spinta al petto alla macchina', 'chest press convergente':'Spinta al petto alla macchina convergente',
  'panca piana smith machine':'Panca piana al multipower', 'panca inclinata smith machine':'Panca inclinata al multipower',
  'push-up classici':'Piegamenti sulle braccia', 'push-up inclinati':'Piegamenti inclinati', 'push-up declinati':'Piegamenti declinati', 'push-up con presa stretta':'Piegamenti a presa stretta',
  'svend press':'Spinta Svend con dischi', 'floor press bilanciere':'Distensioni da terra con bilanciere', 'floor press manubri':'Distensioni da terra con manubri',
  'pulldown braccia tese ai cavi':'Trazione ai cavi a braccia tese', 'back extension macchina':'Iperestensioni alla macchina', 'good morning':'Piegamenti del busto con bilanciere (good morning)',
  'military press bilanciere':'Spinte sopra la testa con bilanciere', 'shoulder press manubri':'Spinte per le spalle con manubri', 'shoulder press macchina':'Spinte per le spalle alla macchina',
  'arnold press':'Spinte Arnold con manubri', 'lento avanti smith machine':'Lento avanti al multipower', 'push press':'Spinta sopra la testa con slancio controllato',
  'reverse fly manubri':'Aperture inverse con manubri', 'face pull':'Tirate al viso ai cavi', 'y-raise su panca inclinata':'Alzate a Y su panca inclinata',
  'curl bilanciere dritto':'Curl bicipiti con bilanciere dritto', 'curl bilanciere ez':'Curl bicipiti con bilanciere EZ', 'curl manubri alternato':'Curl bicipiti alternato con manubri',
  'curl manubri simultaneo':'Curl bicipiti simultaneo con manubri', 'curl martello':'Curl a martello con manubri', 'curl martello ai cavi':'Curl a martello ai cavi',
  'curl panca scott bilanciere ez':'Curl sulla panca Scott con bilanciere EZ', 'curl panca scott manubrio':'Curl sulla panca Scott con manubrio', 'curl concentrato':'Curl concentrato per bicipiti',
  'curl ai cavi bassi':'Curl bicipiti ai cavi bassi', 'curl ai cavi con barra':'Curl bicipiti ai cavi con barra', 'curl al cavo singolo':'Curl bicipiti al cavo singolo',
  'curl inclinato manubri':'Curl con manubri su panca inclinata', 'spider curl':'Curl bicipiti su panca inclinata prona', 'drag curl bilanciere':'Curl trascinato con bilanciere',
  'french press bilanciere ez':'Estensioni tricipiti con bilanciere EZ', 'french press manubri':'Estensioni tricipiti con manubri', 'kickback manubrio':'Estensioni tricipiti all’indietro con manubrio', 'kickback ai cavi':'Estensioni tricipiti all’indietro ai cavi',
  'squat bilanciere high bar':'Squat con bilanciere alto', 'squat bilanciere low bar':'Squat con bilanciere basso', 'front squat':'Squat frontale', 'goblet squat':'Squat con manubrio al petto',
  'hack squat macchina':'Squat alla macchina hack', 'leg press 45 gradi':'Pressa a 45 gradi', 'leg press orizzontale':'Pressa orizzontale', 'smith machine squat':'Squat al multipower',
  'bulgarian split squat manubri':'Affondi bulgari con manubri', 'step-up con manubri':'Salita su panca con manubri', 'leg extension':'Estensioni delle gambe alla macchina',
  'leg curl sdraiato':'Flessioni delle gambe da sdraiato', 'leg curl seduto':'Flessioni delle gambe da seduto', 'leg curl in piedi':'Flessioni della gamba in piedi',
  'hip hinge con kettlebell':'Cerniera d’anca con kettlebell', 'adductor machine':'Macchina per gli adduttori', 'abductor machine':'Macchina per gli abduttori',
  'sissy squat':'Squat sissy', 'pistol squat assistito':'Squat su una gamba assistito', 'nordic hamstring curl':'Flessioni nordiche per i femorali', 'reverse nordic curl':'Flessioni nordiche inverse',
  'leg press a una gamba':'Pressa a una gamba', 'hip thrust bilanciere':'Spinta d’anca con bilanciere', 'hip thrust macchina':'Spinta d’anca alla macchina',
  'kickback glutei ai cavi':'Slanci posteriori per i glutei ai cavi', 'kickback glutei macchina':'Slanci posteriori per i glutei alla macchina', 'pull-through ai cavi':'Estensione d’anca ai cavi',
  'step-up focus glutei':'Salita su panca per i glutei', 'back extension focus glutei':'Iperestensioni con focus sui glutei', 'calf raise in piedi macchina':'Sollevamenti sui polpacci in piedi alla macchina',
  'calf raise seduto':'Sollevamenti sui polpacci da seduto', 'calf raise alla leg press':'Sollevamenti sui polpacci alla pressa', 'calf raise con manubri':'Sollevamenti sui polpacci con manubri',
  'calf raise su gradino a corpo libero':'Sollevamenti sui polpacci su gradino', 'calf raise donkey':'Sollevamenti sui polpacci inclinati (donkey)',
  'leg raise alla sbarra':'Sollevamento delle gambe alla sbarra', 'knee raise alla sbarra':'Sollevamento delle ginocchia alla sbarra', 'plank':'Plank (tenuta isometrica)',
  'side plank':'Plank laterale', 'ab wheel rollout':'Rotolamento con ruota addominale', 'pallof press':'Spinta antirotazionale ai cavi', 'russian twist':'Torsioni russe per gli addominali', 'sled push':'Spinta della slitta',
  'abduction des hanches à la machine':'Abduzioni dell’anca alla macchina', 'abduction des hanches assis':'Abduzioni dell’anca da seduto',
  'adduction de hanche assise':'Adduzioni dell’anca alla macchina', 'adduction debout (poulie)':'Adduzioni dell’anca in piedi ai cavi',
  '90/90 hamstring / barre-style stretch':'Mobilità 90/90 per i femorali', '90/90 hip switches':'Rotazioni d’anca 90/90', 'ab wheel rollout':'Rotolamento con ruota addominale'
};
const DATASET_NAME_OVERRIDES = {
  '90/90 flessore della coscia':'Mobilità 90/90 per i femorali',
  'abbraccia le ginocchia al petto':'Ginocchia al petto da sdraiato',
  'abduttore della coscia':'Abduzioni dell’anca alla macchina',
  'adduttore della coscia':'Adduzioni dell’anca alla macchina',
  'affondi con manubri':'Affondi in camminata con manubri',
  'split squat bulgaro con manubri':'Affondi bulgari con manubri',
  'curl con manubri inclinato alternato':'Curl alternato con manubri su panca inclinata',
  'macchina per crunch addominali':'Crunch addominali alla macchina',
  'ab roller':'Rotolamento con ruota addominale',
  'ab wheel rollout':'Rotolamento con ruota addominale',
  'barbell bench press':'Panca piana con bilanciere',
  'bench press':'Panca piana con bilanciere',
  'dumbbell bench press':'Panca piana con manubri',
  'incline dumbbell press':'Panca inclinata con manubri',
  'incline barbell bench press':'Panca inclinata con bilanciere',
  'decline barbell bench press':'Panca declinata con bilanciere',
  'barbell squat':'Squat con bilanciere',
  'barbell deadlift':'Stacco da terra con bilanciere',
  'romanian deadlift':'Stacco rumeno',
  'barbell bent over row':'Rematore con bilanciere',
  'one arm dumbbell row':'Rematore con manubrio a un braccio',
  'lat pull down':'Lat machine avanti',
  'lat pulldown':'Lat machine avanti',
  'pull up':'Trazioni alla sbarra',
  'chin up':'Trazioni alla sbarra a presa supina',
  'barbell curl':'Curl bicipiti con bilanciere',
  'hammer curls':'Curl a martello con manubri',
  'dumbbell shoulder press':'Spinte per le spalle con manubri',
  'military press':'Lento avanti con bilanciere',
  'lateral raise':'Alzate laterali con manubri',
  'triceps pushdown':'Push-down per tricipiti ai cavi',
  'cable triceps pushdown':'Push-down per tricipiti ai cavi',
  'leg extension':'Estensioni delle gambe alla macchina',
  'lying leg curls':'Leg curl da sdraiato',
  'seated leg curl':'Leg curl da seduto',
  'leg press':'Pressa per le gambe',
  'hip thrust':'Hip thrust',
  'standing calf raises':'Sollevamenti sui polpacci in piedi',
  'seated calf raise':'Sollevamenti sui polpacci da seduto',
  'plank':'Plank isometrico',
  'side plank':'Plank laterale',
  'russian twist':'Torsioni russe per gli addominali',
  'mountain climbers':'Mountain climber',
  'push ups':'Piegamenti sulle braccia',
  'push-up':'Piegamenti sulle braccia',
  'burpees':'Burpee',
  'jumping jacks':'Salti a gambe divaricate (jumping jack)',
  'air bike':'Crunch bicicletta',
  'treadmill':'Tapis roulant',
  'stationary bike':'Cyclette',
  'rowing machine':'Vogatore',
};
function localizeExerciseName(name) {
  const raw=String(name||'').trim();
  const key=raw.toLocaleLowerCase('it').replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const mapped = DATASET_NAME_OVERRIDES[key] || EXERCISE_NAME_IT[key];
  if (mapped) return mapped;
  // In Italian, exercise names use sentence case rather than capitalizing every word.
  let clean = raw.charAt(0).toLocaleUpperCase('it') + raw.slice(1).toLocaleLowerCase('it');
  clean = clean.replace(/\bez\b/gi, 'EZ').replace(/\bt-bar\b/gi, 'T-bar').replace(/\bhiit\b/gi, 'HIIT').replace(/\btrx\b/gi, 'TRX');
  return clean;
}
function localizeEquipment(value) {
  const map={'bodyweight exercise':'Corpo libero','none (bodyweight exercise)':'Corpo libero','barbell':'Bilanciere','dumbbell':'Manubri','dumbbells':'Manubri','cable machine':'Macchina ai cavi','cable':'Cavi','machine':'Macchina','leverage machine':'Macchina a leve','resistance band':'Elastico','kettlebell':'Kettlebell','pull-up bar':'Sbarra per trazioni','bench':'Panca','smith machine':'Multipower','ez curl bar':'Bilanciere EZ','medicine ball':'Palla medica','gym mat':'Tappetino','incline bench':'Panca inclinata','none':'Corpo libero','body only':'Corpo libero','dumbbell':'Manubri','dumbbells':'Manubri','cable machine':'Macchina ai cavi','leverage machine':'Macchina a leve','bands':'Elastico','foam roll':'Rullo massaggiante','exercise ball':'Fitball','medicine ball':'Palla medica','other':'Attrezzatura varia','machine':'Macchina','kettlebells':'Kettlebell','pull-up bar':'Sbarra per trazioni','e-z curl bar':'Bilanciere EZ','ez curl bar':'Bilanciere EZ','rope':'Corda','treadmill':'Tapis roulant','stationary bike':'Cyclette','rowing machine':'Vogatore'};
  return String(value||'').split(',').map(part=>{const key=part.trim().toLocaleLowerCase('it');return map[key]||part.trim();}).filter(Boolean).join(', ');
}

EXERCISE_CATALOG.forEach(item => { item.name = localizeExerciseName(item.name); item.equipment = localizeEquipment(item.equipment); });
function exerciseVisual(item) {
  const name = String(item?.name || '').toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const id = String(item?.catalog_id || item?.exercise_id || item?.id || '').toLocaleLowerCase('it');
  // Immagini originali Marchesano Gym. I percorsi supportano sia la cartella
  // consigliata assets/exercises sia i file caricati per errore nella root.
  // Mappatura esplicita: usa l'ID quando è quello del catalogo, altrimenti il nome normalizzato.
  // Non usare immagini simili per esercizi diversi: in caso di dubbio resta l'illustrazione generica.
  const artById = {
    'panca-piana-bilanciere':'panca-piana-bilanciere',
    'panca-piana-manubri':'panca-piana-manubri',
    'panca-inclinata-bilanciere':'panca-inclinata-bilanciere',
    'panca-inclinata-manubri':'panca-inclinata-manubri',
    'chest-press':'chest-press',
    'croci-manubri-piana':'croci-manubri-piana',
    'croci-cavi':'croci-cavi',
    'pec-deck':'pec-deck',
    'push-up':'push-up',
    'dip-petto':'dip-petto',
    'squat-bilanciere':'squat-bilanciere',
    'stacco-da-terra':'stacco-da-terra',
    'stacco-convenzionale':'stacco-da-terra',
    'lat-machine':'lat-machine',
    'pulley-basso':'pulley-basso',
    'lento-avanti':'lento-avanti',
    'military-press':'lento-avanti',
    'alzate-laterali':'alzate-laterali',
    'curl-manubri':'curl-manubri',
    'pushdown-corda':'pushdown-corda'
  };
  const nameKey = name.replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  // Guide fotografiche create per Marchesano Gym: priorità alle immagini esatte dell'esercizio.
  // Se non esiste una guida corrispondente, non viene mostrata una foto di un esercizio diverso.
  const posterByName = [
    [/^abduzioni dell anca alla macchina$/, 'abduzioni-anca-macchina.webp'],
    [/^affondi in camminata con manubri$/, 'affondi-camminata-manubri.webp'],
    [/^alzate frontali con manubri$/, 'alzate-frontali-manubri.webp'],
    [/^alzate laterali con manubri$/, 'alzate-laterali-manubri-poster.webp'],
    [/^alzate laterali seduto a busto inclinato$/, 'alzate-laterali-seduto-busto-inclinato.webp'],
    [/^aperture inverse per deltoidi posteriori$/, 'aperture-inverse-deltoidi-posteriori.webp'],
    [/^(calf raise da seduto|calf raise seduto)$/, 'calf-raise-seduto-poster.webp'],
    [/^calf raise in piedi$/, 'calf-raise-in-piedi-poster.webp'],
    [/^calf raise in piedi con bilanciere su rialzo$/, 'calf-raise-bilanciere-rialzo.webp'],
    [/^chest press alla macchina$/, 'chest-press-poster.webp'],
    [/^croci ai cavi$/, 'croci-cavi.webp'],
    [/^croci al cavo alto monolaterali$/, 'croci-cavi-alto-monolaterali.webp'],
    [/^croci con manubri su panca piana$/, 'croci-manubri-piana.webp']
  ];
  const poster = posterByName.find(([pattern]) => pattern.test(nameKey));
  if (poster) {
    const file = poster[1];
    return `<div class="mg-exercise-art mg-photo-art mg-poster-art" role="img" aria-label="Guida tecnica: ${escapeHtml(item.name)}"><img src="./assets/exercises/${file}?v=27" alt="Guida tecnica ${escapeHtml(item.name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none';this.parentElement.classList.add('mg-photo-missing')" /></div>`;
  }
  const artByName = [
    [/^(panca piana con bilanciere|distensioni su panca piana con bilanciere|bench press con bilanciere)$/, 'panca-piana-bilanciere'],
    [/^(panca piana con manubri|distensioni su panca piana con manubri)$/, 'panca-piana-manubri'],
    [/^(panca inclinata con bilanciere|distensioni su panca inclinata con bilanciere)$/, 'panca-inclinata-bilanciere'],
    [/^(panca inclinata con manubri|distensioni su panca inclinata con manubri)$/, 'panca-inclinata-manubri'],
    [/^(chest press|chest press alla macchina|spinte al petto alla macchina)$/, 'chest-press'],
    [/^(croci con manubri su panca piana|croci manubri panca piana)$/, 'croci-manubri-piana'],
    [/^(croci ai cavi|cable fly|cable crossover)$/, 'croci-cavi'],
    [/^(pec deck|pec deck butterfly|butterfly|pec deck butterfly macchina)$/, 'pec-deck'],
    [/^(piegamenti sulle braccia|push up|push up sulle braccia|flessioni)$/, 'push-up'],
    [/^(dip alle parallele focus petto|dip alle parallele|dip focus petto|dips)$/, 'dip-petto'],
    [/^(squat con bilanciere|back squat con bilanciere)$/, 'squat-bilanciere'],
    [/^(stacco da terra|stacco convenzionale|deadlift)$/, 'stacco-da-terra'],
    [/^(lat machine presa prona|lat machine avanti|lat pulldown)$/, 'lat-machine'],
    [/^(pulley basso|pulley basso da seduto|rematore al pulley basso)$/, 'pulley-basso'],
    [/^(lento avanti con bilanciere|military press con bilanciere|military press)$/, 'lento-avanti'],
    [/^(alzate laterali con manubri|alzate laterali)$/, 'alzate-laterali'],
    [/^(curl con manubri|curl alternato con manubri|curl con manubri in piedi)$/, 'curl-manubri'],
    [/^(push down per tricipiti con corda|push down con corda|pushdown per tricipiti con corda|triceps pushdown)$/, 'pushdown-corda']
  ];
  let customArt = artById[id] || '';
  if (!customArt) {
    const exact = artByName.find(([pattern]) => pattern.test(nameKey));
    if (exact) customArt = exact[1];
  }
  // Protezione esplicita: non associare l'immagine del push-down in piedi alla variante su panca inclinata.
  if (/push.?down/.test(nameKey) && /panca inclinata/.test(nameKey)) customArt = '';

  if (customArt) {
    const file = `${customArt}.webp`;
    return `<div class="mg-exercise-art mg-photo-art" role="img" aria-label="Illustrazione Marchesano Gym: ${escapeHtml(item.name)}"><img src="./${file}?v=25" alt="Illustrazione di ${escapeHtml(item.name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none';this.parentElement.classList.add('mg-photo-missing')" /></div>`;
  }
  const muscle = item?.muscle_group || 'Fitness';
  const colors = {Petto:'#ff4b55',Schiena:'#ff6b3d',Spalle:'#f24e68',Bicipiti:'#f75a93',Tricipiti:'#ff5b4d',Gambe:'#f04747',Glutei:'#ef6a43',Polpacci:'#ff784e',Addome:'#ed4554'};
  const accent = colors[muscle] || '#ff454f';
  const bench = /panca|bench|croci|press/.test(name);
  const squat = /squat|pressa|affondi|stacco|calf|leg curl|leg extension|hip thrust/.test(name);
  const pull = /rematore|trazioni|lat machine|pulley|curl|face pull|pulldown/.test(name);
  const overhead = /spinte sopra|lento|military|alzate|arnold/.test(name);
  const bar = /bilanciere|stacco|squat|panca|military|lento/.test(name);
  const equipment = bench ? `<path d="M12 78h72M25 77l-5 13M73 77l5 13" stroke="#737986" stroke-width="4" stroke-linecap="round"/><rect x="20" y="69" width="52" height="8" rx="3" fill="#343741" stroke="#8b909d"/>${bar?`<path d="M18 43h64" stroke="#c8ccd5" stroke-width="3" stroke-linecap="round"/><rect x="13" y="35" width="5" height="16" rx="1.5" fill="${accent}"/><rect x="82" y="35" width="5" height="16" rx="1.5" fill="${accent}"/>`:`<circle cx="34" cy="48" r="4" fill="${accent}"/><circle cx="66" cy="48" r="4" fill="${accent}"/>`}` : squat && bar ? `<path d="M13 37h74" stroke="#c8ccd5" stroke-width="3" stroke-linecap="round"/><rect x="10" y="29" width="6" height="16" rx="1.5" fill="${accent}"/><rect x="84" y="29" width="6" height="16" rx="1.5" fill="${accent}"/>` : overhead && bar ? `<path d="M13 19h74" stroke="#c8ccd5" stroke-width="3" stroke-linecap="round"/><rect x="10" y="11" width="6" height="16" rx="1.5" fill="${accent}"/><rect x="84" y="11" width="6" height="16" rx="1.5" fill="${accent}"/>` : bar ? `<path d="M13 72h74" stroke="#c8ccd5" stroke-width="3" stroke-linecap="round"/><rect x="10" y="64" width="6" height="16" rx="1.5" fill="${accent}"/><rect x="84" y="64" width="6" height="16" rx="1.5" fill="${accent}"/>` : bench ? `<path d="M12 78h72" stroke="#737986" stroke-width="4"/>` : pull ? `<path d="M23 25h54M29 25v10M71 25v10" stroke="#777e8d" stroke-width="4" stroke-linecap="round"/>` : `<circle cx="25" cy="67" r="6" fill="${accent}"/><circle cx="75" cy="67" r="6" fill="${accent}"/>`;
  const body = squat ? `<circle cx="49" cy="33" r="7" fill="#f3d4c2"/><path d="M49 41l-2 18 13 9M47 59l-13 14 1 12M60 68l11 12 1 6M48 45l-13 10-7 -3" stroke="#e8eaf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M46 47l10 12" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>` : bench ? `<circle cx="31" cy="60" r="6" fill="#f3d4c2"/><path d="M37 61l19 4 12 9M43 62L38 49 32 45M47 63L52 48 59 45M68 74l10 4" stroke="#e8eaf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M38 49L32 45M52 48l7 -3" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>` : overhead ? `<circle cx="50" cy="39" r="7" fill="#f3d4c2"/><path d="M50 47v21M50 52L35 37 29 27M50 52L65 37 71 27M50 68L40 87M50 68L61 87" stroke="#e8eaf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M35 37L29 27M65 37L71 27" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>` : pull ? `<circle cx="49" cy="35" r="7" fill="#f3d4c2"/><path d="M49 43l2 19M50 48L35 56 31 43M51 48l16 6 4 -11M51 62L39 82M51 62l15 19" stroke="#e8eaf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M35 56L31 43M67 54l4 -11" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>` : `<circle cx="49" cy="38" r="7" fill="#f3d4c2"/><path d="M49 46l1 22M50 51L36 61 30 54M50 51l14 10 8 -6M50 68L39 87M50 68l14 19" stroke="#e8eaf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M36 61L30 54M64 61l8 -6" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
  return `<div class="mg-exercise-art" role="img" aria-label="Illustrazione originale Marchesano Gym: ${escapeHtml(item.name)}" style="--art-accent:${accent}"><div class="mg-art-glow"></div><span class="mg-art-kicker">MARCHESANO / MOVEMENT LAB</span><svg viewBox="0 0 100 100" aria-hidden="true">${equipment}${body}<path d="M8 91h84" stroke="#454954" stroke-width="1"/><circle cx="85" cy="18" r="7" fill="${accent}" opacity=".18"/><path d="M82 18h6M85 15v6" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/></svg><span class="mg-art-label">${escapeHtml(muscle.toLocaleUpperCase('it'))}</span></div>`;
}
function openExerciseLibrary(plan = null) {
  activePlanForExercise = plan;
  exerciseTab = 'catalog'; catalogLimit = 100;
  toolBackAction = () => plan ? openPlanDetails(plan) : showDashboard();
  $('toolTitle').textContent = plan ? 'Scegli gli esercizi' : 'Exercise Lab';
  const muscles = [...new Set(EXERCISE_CATALOG.map(x=>x.muscle_group))].sort((a,b)=>a.localeCompare(b,'it'));
  const countFor = m => EXERCISE_CATALOG.filter(x=>x.muscle_group===m).length;
  $('toolContent').innerHTML = `
    <section class="mg-library-intro">
      <div class="mg-library-brandline"><span class="mg-live-dot"></span> MARCHESANO GYM <span>/</span> MOVEMENT LAB</div>
      <div class="mg-library-title-row"><div><p class="eyebrow">IL TUO ATLANTE DELLA FORZA</p><h2>${plan ? 'Scegli il prossimo movimento.' : 'Trova il tuo\nprossimo movimento.'}</h2><p class="mg-library-subtitle">Esercizi selezionati, tecnica spiegata e focus muscolare. Senza rumore.</p></div><div class="mg-library-mark"><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M8 21v18M15 14v32M22 23v14M22 30h16M38 23v14M45 14v32M52 21v18"/><path d="M7 30h46"/></svg></div></div>
      <div class="mg-library-stats"><div><strong>${EXERCISE_CATALOG.length}</strong><span>ESERCIZI CURATI</span></div><div><strong>${muscles.length}</strong><span>AREE MUSCOLARI</span></div><div><strong>01</strong><span>METODO: TECNICA</span></div></div>
    </section>
    <div class="mg-library-search-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input id="catalogSearch" type="search" placeholder="Cerca: panca piana, squat, dorsali…" aria-label="Cerca esercizi"><kbd>⌕</kbd></div>
    <div class="mg-library-controls"><div class="mg-section-label"><span>ESPLORA PER AREA</span><button id="toggleFavoritesOnly" class="mg-favorite-toggle" type="button" aria-pressed="false">☆ Preferiti</button></div><div class="mg-muscle-chips" id="muscleChips"><button type="button" class="mg-muscle-chip active" data-muscle="">Tutti <span>${EXERCISE_CATALOG.length}</span></button>${muscles.map(m=>`<button type="button" class="mg-muscle-chip" data-muscle="${escapeHtml(m)}">${escapeHtml(m)} <span>${countFor(m)}</span></button>`).join('')}</div></div>
    <div class="mg-library-filterline"><div><p class="eyebrow">IL CATALOGO</p><h3 id="catalogHeading">Tutti i movimenti</h3></div><div class="mg-filter-selects"><select id="catalogMuscle" aria-label="Gruppo muscolare" class="hidden"><option value="">Tutti i gruppi muscolari</option>${muscles.map(m=>`<option>${escapeHtml(m)}</option>`).join('')}</select><select id="catalogEquipment" aria-label="Filtra per attrezzatura"><option value="">Attrezzatura · tutte</option>${[...new Set(EXERCISE_CATALOG.map(x=>x.equipment))].sort((a,b)=>a.localeCompare(b,'it')).map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select><button id="mgClearFilters" type="button" class="mg-clear-filter">Reset</button></div></div>
    <div class="mg-catalog-resultline"><span id="catalogCount">${EXERCISE_CATALOG.length} esercizi</span><span>APRINE UNO PER LA GUIDA COMPLETA ↗</span></div>
    <div class="exercise-actions mg-library-actions"><button id="showMyExercises" class="secondary-button" type="button">⌂ I miei esercizi</button><button id="toggleCustomExercise" class="secondary-button" type="button">＋ Crea esercizio</button></div>
    <form id="exerciseForm" class="panel form-panel hidden"><h3>Nuovo esercizio personale</h3><label>Nome esercizio<input id="exerciseName" required placeholder="Es. Panca piana con bilanciere"></label><label>Gruppo muscolare<select id="exerciseMuscle">${muscles.map(m=>`<option>${escapeHtml(m)}</option>`).join('')}<option>Altro</option></select></label><label>Attrezzatura<input id="exerciseEquipment" placeholder="Bilanciere, manubri, cavi…"></label><label>Istruzioni<textarea id="exerciseInstructions" rows="3" placeholder="Descrivi la tecnica corretta"></textarea></label><button class="primary-button" type="submit">Salva esercizio <span>→</span></button><p id="exerciseMessage" class="status-message"></p></form>
    <p id="catalogMessage" class="status-message" role="status"></p><div id="exerciseList" class="mg-exercise-grid"></div><button id="catalogLoadMore" class="secondary-button load-more-button hidden" type="button">Mostra altri esercizi</button>
    <p class="mg-catalog-note"><span>✳</span> Catalogo Marchesano Gym: selezione e schede tecniche curate internamente. Le illustrazioni presenti in questa versione sono originali e stilizzate; possiamo sostituirle progressivamente con fotografie dedicate verificate per ogni esercizio.</p>`;
  favoritesOnly=false;
  $('toggleFavoritesOnly').addEventListener('click', () => { favoritesOnly=!favoritesOnly; $('toggleFavoritesOnly').setAttribute('aria-pressed',String(favoritesOnly)); $('toggleFavoritesOnly').innerHTML=favoritesOnly?'★ Solo preferiti':'☆ Preferiti'; catalogLimit=100; renderExerciseCatalog(); });
  $('catalogSearch').addEventListener('input', () => {catalogLimit=100; renderExerciseCatalog();});
  $('catalogMuscle').addEventListener('change', () => {catalogLimit=100;renderExerciseCatalog();});
  $('catalogEquipment').addEventListener('change', () => {catalogLimit=100;renderExerciseCatalog();});
  $('muscleChips').addEventListener('click',e=>{const btn=e.target.closest('[data-muscle]');if(!btn)return;const muscle=btn.dataset.muscle||'';$('catalogMuscle').value=muscle;document.querySelectorAll('.mg-muscle-chip').forEach(x=>x.classList.toggle('active',x===btn));$('catalogHeading').textContent=muscle||'Tutti i movimenti';catalogLimit=100;renderExerciseCatalog();});
  $('mgClearFilters').addEventListener('click',()=>{$('catalogSearch').value='';$('catalogMuscle').value='';$('catalogEquipment').value='';favoritesOnly=false;$('toggleFavoritesOnly').setAttribute('aria-pressed','false');$('toggleFavoritesOnly').textContent='☆ Preferiti';document.querySelectorAll('.mg-muscle-chip').forEach((x,i)=>x.classList.toggle('active',i===0));$('catalogHeading').textContent='Tutti i movimenti';catalogLimit=100;renderExerciseCatalog();});
  $('toggleCustomExercise').addEventListener('click', () => $('exerciseForm').classList.toggle('hidden'));
  $('showMyExercises').addEventListener('click', loadExercises);
  // Il catalogo ufficiale Marchesano Gym è locale e curato: non viene più sovrascritto da dataset remoti.
  $('exerciseForm').addEventListener('submit', saveExercise);
  renderExerciseCatalog();
  showToolPage(plan ? 'plans' : 'exercises');
}
function renderExerciseCatalog() {
  const list = $('exerciseList'); if (!list) return;
  const q = ($('catalogSearch')?.value || '').trim().toLocaleLowerCase('it');
  const muscle = $('catalogMuscle')?.value || '';
  const equipment = $('catalogEquipment')?.value || '';
  const queryWords=q.split(/\s+/).filter(Boolean);
  const rows = EXERCISE_CATALOG.filter(x => {
    const title=String(x.name||'').toLocaleLowerCase('it');
    const aliases=Array.isArray(x.aliases)?x.aliases.join(' ').toLocaleLowerCase('it'):'';
    const favorite=isFavoriteExercise(x);
    return (!muscle || x.muscle_group === muscle) && (!equipment || x.equipment === equipment) && (!favoritesOnly || favorite) && (!queryWords.length || queryWords.every(word=>title.includes(word)) || queryWords.every(word=>aliases.includes(word)) || queryWords.every(word=>(title+' '+aliases+' '+x.muscle_group+' '+x.equipment+' '+x.goal).toLocaleLowerCase('it').includes(word)));
  }).sort((a,b)=>{
    if(!queryWords.length)return a.name.localeCompare(b.name,'it');
    const score=x=>queryWords.every(word=>String(x.name||'').toLocaleLowerCase('it').includes(word))?0:queryWords.every(word=>(x.aliases||[]).join(' ').toLocaleLowerCase('it').includes(word))?1:2;
    return score(a)-score(b)||a.name.localeCompare(b.name,'it');
  });
  const count = $('catalogCount'); if (count) count.textContent = `${rows.length} ${rows.length===1?'movimento':'movimenti'}`;
  const heading=$('catalogHeading'); if(heading) heading.textContent=q?`Risultati per “${q}”`:(muscle||'Tutti i movimenti');
  if (!rows.length) { list.innerHTML = '<div class="mg-empty-results"><span>⌕</span><h3>Nessun movimento trovato</h3><p>Prova un nome più semplice o azzera i filtri.</p><button type="button" class="secondary-button" id="mgEmptyReset">Azzera ricerca</button></div>'; $('catalogLoadMore').classList.add('hidden'); $('mgEmptyReset')?.addEventListener('click',()=>$('mgClearFilters').click()); return; }
  const shown = rows.slice(0,catalogLimit);
  list.innerHTML = shown.map((x) => {
    const idx = EXERCISE_CATALOG.indexOf(x); const favorite=isFavoriteExercise(x);
    return `<article class="mg-exercise-card" data-open-row="${idx}" tabindex="0" role="button" aria-label="Apri guida: ${escapeHtml(x.name)}"><div class="mg-card-art">${exerciseVisual(x)}<span class="mg-card-level">${escapeHtml(x.level||'Intermedio')}</span><button class="mg-card-star ${favorite?'is-favorite':''}" type="button" data-favorite-index="${idx}" aria-label="${favorite?'Rimuovi dai':'Aggiungi ai'} preferiti">${favorite?'★':'☆'}</button></div><div class="mg-card-body"><div class="mg-card-meta"><span>${escapeHtml(x.muscle_group)}</span><i></i><span>${escapeHtml(x.goal||'Forza')}</span></div><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.equipment)} <span>·</span> ${escapeHtml(x.level||'Intermedio')}</p><div class="mg-card-bottom"><span class="mg-guide-link">GUIDA TECNICA <b>↗</b></span><button class="mg-card-add" type="button" data-catalog-index="${idx}" aria-label="Aggiungi ${escapeHtml(x.name)} alla scheda">＋</button></div></div></article>`;
  }).join('');
  $('catalogLoadMore').classList.toggle('hidden', rows.length <= catalogLimit);
  list.querySelectorAll('[data-open-row]').forEach(row=>{
    const open=()=>openExerciseDetail(EXERCISE_CATALOG[Number(row.dataset.openRow)]);
    row.addEventListener('click',e=>{if(e.target.closest('[data-catalog-index],[data-favorite-index]'))return;open();});
    row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
  list.querySelectorAll('[data-favorite-index]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const item=EXERCISE_CATALOG[Number(btn.dataset.favoriteIndex)];if(item)toggleFavoriteExercise(item);}));
  list.querySelectorAll('[data-catalog-index]').forEach(btn => btn.addEventListener('click', async (e) => {
    e.stopPropagation(); const item = EXERCISE_CATALOG[Number(btn.dataset.catalogIndex)];
    if (!activePlanForExercise) { openPlanPickerForExercise(item); return; }
    btn.disabled = true; btn.textContent = '…';
    try { const saved = await ensureUserExercise(item); await addExerciseToPlan(activePlanForExercise, saved); message('catalogMessage', `${item.name} aggiunto alla scheda.`); await loadPlanExercises(activePlanForExercise); }
    catch (err) { message('catalogMessage', err.message || 'Impossibile aggiungere l’esercizio.', true); }
    finally { btn.disabled = false; btn.textContent = '＋'; }
  }));
}
function openExerciseDetail(item){
  if(!item)return;
  const plan=activePlanForExercise;
  toolBackAction=()=>openExerciseLibrary(plan);
  openTool(item.name,`<section class="exercise-detail-page"><button id="detailBackToLibrary" class="secondary-button" type="button">← Torna agli esercizi</button><div class="exercise-detail-hero">${exerciseVisual(item)}</div><div class="exercise-detail-heading"><p class="eyebrow">GUIDA ALL’ESERCIZIO</p><h2>${escapeHtml(item.name)}</h2><div class="exercise-detail-tags"><span>${escapeHtml(item.muscle_group||'Altro')}</span><span>${escapeHtml(item.equipment||'Attrezzatura varia')}</span></div></div><div class="mg-detail-quickfacts"><div><span>OBIETTIVO</span><strong>${escapeHtml(item.goal||'Forza e massa')}</strong></div><div><span>LIVELLO</span><strong>${escapeHtml(item.level||'Intermedio')}</strong></div><div><span>ATTREZZATURA</span><strong>${escapeHtml(item.equipment||'Corpo libero')}</strong></div></div><div class="exercise-detail-panel mg-detail-panel"><p class="eyebrow">MUSCOLI COINVOLTI</p><p>${escapeHtml(MUSCLE_DESCRIPTIONS[item.muscle_group]||'Muscoli coinvolti in base alla variante e alla tecnica.')}</p><p class="eyebrow">ESECUZIONE · PASSO PER PASSO</p><p>${escapeHtml(exerciseGuide(item))}</p><p class="eyebrow">CUE TECNICO</p><p>Controlla la fase di ritorno, mantieni la respirazione regolare e interrompi la serie se perdi la posizione. Aumenta il carico solo quando le ripetizioni restano pulite.</p><p class="exercise-safety-note">La guida è informativa: adatta l’esercizio alla tua esperienza e non allenarti attraverso il dolore.</p></div><button id="detailAddExercise" class="primary-button" type="button">＋ ${plan?'Aggiungi a questa scheda':'Aggiungi a una scheda'} <span>→</span></button></section>`);
  showToolPage('exercises');
  $('detailBackToLibrary')?.addEventListener('click',()=>openExerciseLibrary(plan));
  $('detailAddExercise')?.addEventListener('click',async()=>{const btn=$('detailAddExercise');btn.disabled=true;btn.textContent='Salvataggio…';try{const saved=await ensureUserExercise(item);if(plan){await addExerciseToPlan(plan,saved);openPlanDetails(plan);message('catalogMessage',`${item.name} aggiunto alla scheda.`);}else openPlanPickerForExercise(item);}catch(err){btn.disabled=false;btn.innerHTML=`＋ ${plan?'Aggiungi a questa scheda':'Aggiungi a una scheda'} <span>→</span>`;const p=document.createElement('p');p.className='status-message';p.textContent=err.message||'Non riesco ad aggiungere l’esercizio.';$('toolContent').append(p);}});
}
function openPlanPickerForExercise(item) {
  const previousBack = () => openExerciseLibrary(null);
  toolBackAction = previousBack;
  $('toolTitle').textContent = 'Scegli la scheda';
  $('toolContent').innerHTML = `<div class="page-intro"><p>Stai aggiungendo <strong>${escapeHtml(item.name)}</strong>. Scegli in quale scheda inserirlo.</p></div><div class="plans-grid">${plans.length ? plans.map(p=>`<article class="plan-card"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || 'Scheda personale')}</p><button class="primary-button compact" type="button" data-add-to-plan="${p.id}">Aggiungi qui →</button></article>`).join('') : '<div class="empty-state"><h3>Nessuna scheda disponibile</h3><p>Crea prima una scheda dalla sezione Schede.</p><button id="pickerCreatePlan" class="primary-button" type="button">＋ Crea scheda</button></div>'}</div><p id="pickerMessage" class="status-message"></p>`;
  showToolPage('plans');
  $('pickerCreatePlan')?.addEventListener('click', openPlanDialog);
  $('toolContent').querySelectorAll('[data-add-to-plan]').forEach(btn => btn.addEventListener('click', async()=>{
    btn.disabled=true; btn.textContent='Salvataggio…';
    try { const plan=plans.find(p=>p.id===btn.dataset.addToPlan); const saved=await ensureUserExercise(item); await addExerciseToPlan(plan,saved); message('pickerMessage',`Aggiunto a ${plan.name}.`); btn.textContent='Aggiunto ✓'; }
    catch(err){message('pickerMessage',err.message || 'Impossibile salvare.',true);btn.disabled=false;btn.textContent='Aggiungi qui →';}
  }));
}
async function loadOnlineExerciseCatalog(silent=false) {
  const button = $('loadOnlineCatalog'); const status = $('catalogMessage');
  if (onlineCatalogLoading) return;
  onlineCatalogLoading = true; if (button) {button.disabled=true;button.textContent='Caricamento…';}
  if (!silent && status) message('catalogMessage','Carico il catalogo italiano con immagini specifiche per esercizio…');
  const stripHtml = s => String(s||'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
  const muscleMap = {chest:'Petto',back:'Schiena',shoulders:'Spalle',biceps:'Bicipiti',triceps:'Tricipiti',forearms:'Avambracci',quadriceps:'Quadricipiti',hamstrings:'Femorali',glutes:'Glutei',calves:'Polpacci',abdominals:'Addome',abductors:'Abduttori',adductors:'Adduttori',traps:'Trapezi','middle back':'Schiena',middle_back:'Schiena','lower back':'Lombari',lower_back:'Lombari',lats:'Dorsali',neck:'Collo'};
  const equipmentMap = {barbell:'Bilanciere',dumbbell:'Manubri',body_only:'Corpo libero',bodyweight:'Corpo libero',cable:'Cavi',machine:'Macchina',bands:'Elastico',kettlebells:'Kettlebell',kettlebell:'Kettlebell',foam_roll:'Rullo massaggiante',medicine_ball:'Palla medica',exercise_ball:'Fitball',e_z_curl_bar:'Bilanciere EZ',other:'Attrezzatura varia',none:'Corpo libero'};
  try {
    const url='https://raw.githubusercontent.com/Conte49/free-exercise-db-italian/main/dist/exercises-it.json';
    const response=await fetch(url,{headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error(`Dataset italiano non disponibile (${response.status})`);
    const payload=await response.json();
    const sourceRows=Array.isArray(payload)?payload:(Array.isArray(payload.exercises)?payload.exercises:[]);
    if(!sourceRows.length) throw new Error('Il dataset non contiene esercizi leggibili.');
    const merged=new Map(EXERCISE_CATALOG.map(x=>[x.name.toLocaleLowerCase('it'),x]));
    let imported=0, withImages=0;
    for(const row of sourceRows){
      const name=String(row.name_it||row.nameIt||row.name||'').trim(); if(!name) continue;
      const muscles=[...(Array.isArray(row.primaryMuscles)?row.primaryMuscles:[]),...(Array.isArray(row.secondaryMuscles)?row.secondaryMuscles:[])].map(m=>muscleMap[String(m).toLowerCase()]||String(m).replace(/_/g,' ')).filter(Boolean);
      let group=muscles.length?muscles[0]:'Altro';
      const muscleAliases={Addominali:'Addome',abdominals:'Addome',chest:'Petto',back:'Schiena',shoulders:'Spalle',biceps:'Bicipiti',triceps:'Tricipiti',quadriceps:'Quadricipiti',hamstrings:'Femorali',glutes:'Glutei',calves:'Polpacci'};
      group=muscleAliases[group]||group; if(!['Petto','Schiena','Spalle','Bicipiti','Tricipiti','Avambracci','Quadricipiti','Femorali','Gambe','Glutei','Polpacci','Addome','Abduttori','Adduttori','Trapezi','Lombari','Cardio'].includes(group)) group='Altro';
      const rawEquipment=String(row.equipment||'').toLowerCase().replace(/\s+/g,'_');
      const equipment=equipmentMap[rawEquipment]||localizeEquipment(String(row.equipment||'Attrezzatura varia'))||'Attrezzatura varia';
      const instructions=Array.isArray(row.instructions_it)?row.instructions_it.join(' '):Array.isArray(row.instructions)?row.instructions.join(' '):String(row.instructions_it||row.instructions||'');
      const paths=Array.isArray(row.images)?row.images:[];
      const first=paths[0];
      let image=null;
      if(typeof first==='string'&&first){ image=first.startsWith('http')?first:`https://raw.githubusercontent.com/Conte49/free-exercise-db-italian/main/exercises/${first.replace(/^\/+/, '')}`; }
      const imageFallback=(typeof row.webp==='string'&&row.webp)?`https://raw.githubusercontent.com/Conte49/free-exercise-db-italian/main/dist/exercises/${row.webp.replace(/^\/+/, '')}`:null;
      if(!image && imageFallback){ image=imageFallback; }
      const item={name:localizeExerciseName(name),muscle_group:group,equipment,instructions:stripHtml(instructions),image,image_fallback:imageFallback,source:'free-exercise-db-italian',source_id:row.id||null,aliases:[row.name||'',row.name_it||'',row.id||''].filter(Boolean),primary_muscles:row.primaryMuscles||[],secondary_muscles:row.secondaryMuscles||[]};
      const key=item.name.toLocaleLowerCase('it'); const existing=merged.get(key);
      if(existing){ if(image&&!existing.image)existing.image=image; if(item.image_fallback&&!existing.image_fallback)existing.image_fallback=item.image_fallback; if(item.instructions&&(!existing.instructions||existing.instructions.length<30))existing.instructions=item.instructions; if(existing.muscle_group==='Altro'&&group!=='Altro')existing.muscle_group=group; if((!existing.equipment||existing.equipment==='Attrezzatura varia')&&equipment)existing.equipment=equipment; existing.aliases=[...new Set([...(existing.aliases||[]),...(item.aliases||[])])]; if(item.source_id&&!existing.source_id)existing.source_id=item.source_id; }
      else {merged.set(key,item);imported++;}
      if(image)withImages++;
    }
    EXERCISE_CATALOG.splice(0,EXERCISE_CATALOG.length,...[...merged.values()].sort((a,b)=>a.name.localeCompare(b.name,'it')));
    onlineCatalogLoaded=true;
    const muscleSelect=$('catalogMuscle'); if(muscleSelect){const selected=muscleSelect.value;muscleSelect.innerHTML='<option value="">Tutti i gruppi muscolari</option>'+[...new Set(EXERCISE_CATALOG.map(x=>x.muscle_group))].sort().map(x=>`<option>${escapeHtml(x)}</option>`).join('');muscleSelect.value=selected;}
    const equipSelect=$('catalogEquipment'); if(equipSelect){const selected=equipSelect.value;equipSelect.innerHTML='<option value="">Tutta l’attrezzatura</option>'+[...new Set(EXERCISE_CATALOG.map(x=>x.equipment))].sort().map(x=>`<option>${escapeHtml(x)}</option>`).join('');equipSelect.value=selected;}
    renderExerciseCatalog(); if(status) message('catalogMessage',`Catalogo aggiornato: ${EXERCISE_CATALOG.length} esercizi disponibili. ${withImages} voci con immagine associata; ${imported} esercizi aggiunti al catalogo.`);
  } catch(err) {
    if(status) message('catalogMessage',`Non riesco a caricare il nuovo catalogo in questo momento. Il catalogo già integrato resta disponibile. (${err.message||'Errore di rete'})`,true);
  }
  finally {onlineCatalogLoading=false;if(button){button.disabled=false;button.textContent='↻ Aggiorna catalogo';}}
}
async function ensureUserExercise(item) {
  if (!currentUser) throw new Error('Accedi per salvare gli esercizi.');
  const { data: existing, error: findError } = await supabase.from('exercises').select('*').eq('user_id', currentUser.id).eq('name', item.name).limit(1);
  if (findError) throw findError;
  const imageUrl = item.image_url || item.image || null;
  if (existing?.length) {
    const saved = existing[0];
    if (imageUrl && !saved.image_url) {
      const { data: updated, error: updateError } = await supabase.from('exercises')
        .update({ image_url: imageUrl })
        .eq('id', saved.id).eq('user_id', currentUser.id).select('*').single();
      if (!updateError && updated) return updated;
    }
    return saved;
  }
  const payload = { user_id: currentUser.id, name: item.name, muscle_group: item.muscle_group, equipment: item.equipment || null, instructions: item.instructions || null, image_url: imageUrl, video_url: item.video_url || null };
  const { data, error } = await supabase.from('exercises').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}
async function addExerciseToPlan(plan, exercise) {
  const { data: rows, error: readError } = await supabase.from('plan_exercises').select('id,sort_order').eq('user_id', currentUser.id).eq('plan_id', plan.id).eq('exercise_id', exercise.id);
  if (readError) throw new Error(`Non riesco a leggere gli esercizi della scheda: ${readError.message}. Controlla anche il file SQL incluso nel pacchetto.`);
  if (rows?.length) throw new Error('Questo esercizio è già presente nella scheda.');
  const { data: currentRows, error: countError } = await supabase.from('plan_exercises').select('sort_order').eq('user_id', currentUser.id).eq('plan_id', plan.id);
  if (countError) throw new Error(`Non riesco a leggere la scheda: ${countError.message}.`);
  const nextOrder = (currentRows || []).reduce((m,x)=>Math.max(m,Number(x.sort_order)||0),0)+1;
  const { error } = await supabase.from('plan_exercises').insert({ user_id: currentUser.id, plan_id: plan.id, exercise_id: exercise.id, sets: 3, reps: 10, rest_seconds: 90, sort_order: nextOrder });
  if (error) throw new Error(`Esercizio salvato nella libreria, ma non aggiunto alla scheda: ${error.message}. Verifica la configurazione SQL inclusa nel pacchetto.`);
}
async function deleteWorkoutPlan(plan, returnToList = true) {
  if (!currentUser || !plan) return;
  const confirmed = window.confirm(`Vuoi eliminare la scheda “${plan.name}”? Gli esercizi verranno rimossi da questa scheda, ma resteranno nella libreria. Le sessioni già registrate non verranno cancellate.`);
  if (!confirmed) return;
  const { error } = await supabase.from('workout_plans').delete().eq('id', plan.id).eq('user_id', currentUser.id);
  if (error) {
    message('catalogMessage', `Non riesco a eliminare la scheda: ${error.message}`, true);
    return;
  }
  plans = plans.filter(item => item.id !== plan.id);
  activePlanForExercise = null;
  await loadDashboardData();
  if (returnToList) openPlansView(); else showDashboard();
}

async function loadPlanExercises(plan) {
  const el = $('planExerciseList'); if (!el) return;
  const { data: rows, error } = await supabase.from('plan_exercises').select('*').eq('user_id', currentUser.id).eq('plan_id', plan.id).order('sort_order');
  if (error) { el.innerHTML = `<p class="status-message">${escapeHtml(error.message)}. Se la tabella non ha le colonne previste, applica il file SQL incluso nel pacchetto.</p>`; return; }
  if (!rows?.length) { el.innerHTML = '<div class="empty-state"><h3>Nessun esercizio ancora</h3><p>Tocca “Aggiungi esercizi” e scegli dal catalogo. Ogni esercizio partirà da 3 serie, 10 ripetizioni e 90 secondi di recupero, modificabili in seguito.</p></div>'; return; }
  const ids = rows.map(x=>x.exercise_id).filter(Boolean);
  const { data: exercises, error: exError } = await supabase.from('exercises').select('id,name,muscle_group,equipment').eq('user_id',currentUser.id).in('id',ids);
  if (exError) { el.innerHTML = `<p class="status-message">${escapeHtml(exError.message)}</p>`; return; }
  const map = new Map((exercises||[]).map(x=>[x.id,x]));
  el.innerHTML = rows.map((r,idx)=>{const x=map.get(r.exercise_id); if(!x) return ''; return `<article class="exercise-card plan-exercise-card"><div><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.muscle_group||'')} · ${escapeHtml(x.equipment||'')}</p><small>${Number(r.sets)||3} serie × ${Number(r.reps)||10} ripetizioni · recupero ${Number(r.rest_seconds)||90}s</small></div><button class="remove-exercise-button" type="button" data-remove-plan-exercise="${r.id}" aria-label="Rimuovi ${escapeHtml(x.name)} dalla scheda" title="Rimuovi dalla scheda">${TRASH_ICON}</button></article>`}).join('');
  el.querySelectorAll('[data-remove-plan-exercise]').forEach(btn=>btn.addEventListener('click',async()=>{
    const card=btn.closest('.plan-exercise-card'); const name=card?.querySelector('strong')?.textContent||'questo esercizio';
    if(!window.confirm(`Vuoi rimuovere “${name}” da questa scheda? L'esercizio resterà nella libreria.`)) return;
    btn.disabled=true;const {error}=await supabase.from('plan_exercises').delete().eq('id',btn.dataset.removePlanExercise).eq('user_id',currentUser.id);if(error){message('catalogMessage',error.message,true);btn.disabled=false;return;}await loadPlanExercises(plan);
  }));
}
async function loadExercises() {
  const list=$('exerciseList'); if(!list||!currentUser)return;
  exerciseTab='mine'; list.innerHTML='<p class="muted">Caricamento dei tuoi esercizi salvati…</p>';
  const {data,error}=await supabase.from('exercises').select('*').eq('user_id',currentUser.id).order('name');
  if(!list.isConnected)return;
  if(error){list.innerHTML=`<p class="status-message">${escapeHtml(error.message)}</p>`;return;}
  list.innerHTML=`<div class="my-exercises-heading"><div><p class="eyebrow">LIBRERIA PERSONALE</p><h2>${data?.length||0} esercizi salvati</h2></div><button id="backToCatalog" class="secondary-button" type="button">← Catalogo completo</button></div>`+(data?.length ? data.map(x=>`<article class="exercise-card exercise-library-card"><div class="exercise-art small-art"><span>${MUSCLE_ICONS[x.muscle_group]||'🏋️'}</span><small>${escapeHtml(x.muscle_group||'FITNESS').toLocaleUpperCase('it')}</small></div><div class="exercise-card-content"><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.muscle_group||'Altro')} · ${escapeHtml(x.equipment||'Attrezzatura varia')}</p><details class="exercise-details"><summary>Descrizione</summary><div class="exercise-description"><p>${escapeHtml(x.instructions||exerciseGuide(x))}</p></div></details>${activePlanForExercise?`<button class="exercise-add-button full-add" data-user-exercise="${x.id}" type="button">＋ Aggiungi alla scheda</button>`:''}</div></article>`).join(''):'<div class="empty-state"><h3>Ancora nessun esercizio personale</h3><p>Non devi crearli uno per uno: scegli un esercizio dal catalogo completo e sarà salvato nella tua libreria quando lo aggiungi a una scheda.</p><button id="backToCatalogEmpty" class="primary-button" type="button">Apri catalogo esercizi →</button></div>');
  $('backToCatalog')?.addEventListener('click',()=>openExerciseLibrary(activePlanForExercise));
  $('backToCatalogEmpty')?.addEventListener('click',()=>openExerciseLibrary(activePlanForExercise));
  list.querySelectorAll('[data-user-exercise]').forEach(btn=>btn.addEventListener('click',async()=>{const item=data.find(x=>x.id===btn.dataset.userExercise);if(!item||!activePlanForExercise)return;btn.disabled=true;try{await addExerciseToPlan(activePlanForExercise,item);message('catalogMessage',`${item.name} aggiunto alla scheda.`);openPlanDetails(activePlanForExercise);}catch(err){message('catalogMessage',err.message,true);btn.disabled=false;}}));
}
async function saveExercise(e) {
  e.preventDefault();
  if (!currentUser) { message('exerciseMessage','Accedi per salvare un esercizio.',true); return; }
  const payload = { user_id:currentUser.id, name:$('exerciseName').value.trim(), muscle_group:$('exerciseMuscle').value, equipment:$('exerciseEquipment').value.trim() || null, instructions:$('exerciseInstructions').value.trim() || null };
  if (!payload.name) { message('exerciseMessage','Inserisci il nome dell’esercizio.',true); return; }
  const submit = $('exerciseForm').querySelector('[type="submit"]'); if (submit) submit.disabled = true;
  const { data: existing, error: findError } = await supabase.from('exercises').select('id').eq('user_id',currentUser.id).eq('name',payload.name).limit(1);
  if (findError) { message('exerciseMessage',findError.message,true); if(submit)submit.disabled=false; return; }
  if (existing?.length) { message('exerciseMessage','Hai già salvato un esercizio con questo nome.',true); if(submit)submit.disabled=false; return; }
  const { error } = await supabase.from('exercises').insert(payload);
  if (error) { message('exerciseMessage',`${error.message} — verifica le policy RLS della tabella exercises in Supabase.`,true); if(submit)submit.disabled=false; return; }
  $('exerciseForm').reset(); message('exerciseMessage','Esercizio salvato correttamente.');
  if (activePlanForExercise) {
    const { data } = await supabase.from('exercises').select('*').eq('user_id',currentUser.id).eq('name',payload.name).limit(1);
    if (data?.[0]) { try { await addExerciseToPlan(activePlanForExercise,data[0]); await loadPlanExercises(activePlanForExercise); } catch(err) { message('exerciseMessage',err.message,true); } }
  }
  if(submit)submit.disabled=false;
  renderExerciseCatalog();
}
async function renderWorkoutDiary() {
  const monthStart = new Date(diaryMonth.getFullYear(), diaryMonth.getMonth(), 1);
  const monthEnd = new Date(diaryMonth.getFullYear(), diaryMonth.getMonth()+1, 0);
  $('toolTitle').textContent = 'Diario allenamenti';
  $('toolContent').innerHTML = `<section class="workout-diary"><div class="diary-intro"><p class="eyebrow">IL TUO PERCORSO</p><p>Seleziona un giorno per vedere le sessioni e apri un allenamento per consultare tutti i dettagli.</p></div><div class="diary-month-bar"><button type="button" id="diaryPrevMonth" class="diary-month-arrow" aria-label="Mese precedente">‹</button><h2 id="diaryMonthLabel">${monthStart.toLocaleDateString('it-IT',{month:'long',year:'numeric'})}</h2><button type="button" id="diaryNextMonth" class="diary-month-arrow" aria-label="Mese successivo">›</button></div><div class="diary-weekdays">${['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d=>`<span>${d}</span>`).join('')}</div><div class="diary-calendar-grid" id="diaryCalendarGrid"><p class="muted">Caricamento calendario…</p></div><div class="diary-legend"><span><i></i> Allenamento registrato</span><span class="muted">Tocca una data per i dettagli</span></div><section class="diary-day-panel"><p class="eyebrow">GIORNO SELEZIONATO</p><h3 id="diarySelectedLabel"></h3><div id="diaryDaySessions" class="diary-session-list"><p class="muted">Caricamento sessioni…</p></div></section></section>`;
  showToolPage('history');
  const {data,error}=await supabase.from('workout_sessions').select('*').eq('user_id',currentUser.id).order('started_at',{ascending:false}).limit(500);
  if(error){$('diaryCalendarGrid').innerHTML=`<p class="status-message">${escapeHtml(error.message)}</p>`;$('diaryDaySessions').innerHTML='';return;}
  diarySessions=data||[];
  // If the selected date has no sessions, keep the selected day; otherwise dates remain browsable.
  drawDiaryCalendar();
  $('diaryPrevMonth').addEventListener('click',()=>{diaryMonth=new Date(diaryMonth.getFullYear(),diaryMonth.getMonth()-1,1);renderWorkoutDiary();});
  $('diaryNextMonth').addEventListener('click',()=>{diaryMonth=new Date(diaryMonth.getFullYear(),diaryMonth.getMonth()+1,1);renderWorkoutDiary();});
}
function drawDiaryCalendar(){
  const label=$('diaryMonthLabel');const grid=$('diaryCalendarGrid');if(!label||!grid)return;
  label.textContent=diaryMonth.toLocaleDateString('it-IT',{month:'long',year:'numeric'});
  const first=new Date(diaryMonth.getFullYear(),diaryMonth.getMonth(),1);const offset=(first.getDay()+6)%7;const daysInMonth=new Date(diaryMonth.getFullYear(),diaryMonth.getMonth()+1,0).getDate();
  const total=Math.ceil((offset+daysInMonth)/7)*7;const today=localDateKey(new Date());const marked=new Set(diarySessions.map(s=>localDateKey(s.started_at)));
  const cells=[];for(let i=0;i<total;i++){const date=new Date(first.getFullYear(),first.getMonth(),i-offset+1);const key=localDateKey(date);const outside=date.getMonth()!==diaryMonth.getMonth();const selected=key===diarySelectedDate;const isToday=key===today;const has=marked.has(key);cells.push(`<button type="button" class="diary-day ${outside?'is-outside':''} ${selected?'is-selected':''} ${isToday?'is-today':''} ${has?'has-workout':''}" data-diary-date="${key}" aria-label="${date.toLocaleDateString('it-IT',{dateStyle:'full'})}${has?', allenamento registrato':''}" aria-pressed="${selected}"><span>${date.getDate()}</span>${has?'<i></i>':''}</button>`);}
  grid.innerHTML=cells.join('');grid.querySelectorAll('[data-diary-date]').forEach(btn=>btn.addEventListener('click',()=>{diarySelectedDate=btn.dataset.diaryDate;drawDiaryCalendar();drawDiaryDaySessions();}));drawDiaryDaySessions();
}
function drawDiaryDaySessions(){
  const title=$('diarySelectedLabel'),el=$('diaryDaySessions');if(!title||!el)return;
  const selected=new Date(`${diarySelectedDate}T12:00:00`);title.textContent=selected.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const sessions=diarySessions.filter(s=>localDateKey(s.started_at)===diarySelectedDate).sort((a,b)=>new Date(a.started_at)-new Date(b.started_at));
  if(!sessions.length){el.innerHTML='<div class="diary-empty"><span>＋</span><strong>Nessun allenamento in questa data</strong><p>Quando registrerai una sessione, la troverai qui.</p></div>';return;}
  el.innerHTML=sessions.map(s=>{const mins=Math.floor((Number(s.duration_seconds)||0)/60);const secs=(Number(s.duration_seconds)||0)%60;const duration=(mins?`${mins} min`:'')+(secs?` ${secs} sec`:'')||'Durata non disponibile';return `<article class="diary-session-card"><button type="button" class="diary-session-open" data-diary-session="${s.id}"><span class="diary-session-icon">${DUMBBELL_ICON}</span><span class="diary-session-copy"><strong>${escapeHtml(s.plan_name||'Allenamento')}</strong><small>${new Date(s.started_at).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · ${duration}</small></span><span class="diary-session-chevron">›</span></button><div id="diaryDetail-${s.id}" class="diary-session-detail hidden"></div></article>`;}).join('');
  el.querySelectorAll('[data-diary-session]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.diarySession;const detail=$(`diaryDetail-${id}`);if(!detail)return;if(!detail.classList.contains('hidden')){detail.classList.add('hidden');return;}el.querySelectorAll('.diary-session-detail').forEach(d=>d.classList.add('hidden'));detail.classList.remove('hidden');loadDiarySessionDetail(sessions.find(s=>String(s.id)===String(id)),detail);}));
}
async function loadDiarySessionDetail(session,el){
  if(!session||!el)return;el.innerHTML='<p class="muted">Caricamento esercizi e serie…</p>';
  const {data:items,error}=await supabase.from('session_exercises').select('*').eq('user_id',currentUser.id).eq('session_id',session.id).order('position',{ascending:true});
  if(error){el.innerHTML=`<p class="status-message">Dettagli non disponibili: ${escapeHtml(error.message)}</p><button class="diary-delete-session" type="button" data-delete-session="${session.id}">${TRASH_ICON} Elimina allenamento</button>`;wireDiaryDelete(el,session);return;}
  const ids=(items||[]).map(x=>x.id);let sets=[];if(ids.length){const result=await supabase.from('workout_sets').select('*').eq('user_id',currentUser.id).in('session_exercise_id',ids).order('set_number',{ascending:true});if(!result.error)sets=result.data||[];}
  const byItem=new Map((items||[]).map(x=>[String(x.id),sets.filter(s=>String(s.session_exercise_id)===String(x.id))]));
  el.innerHTML=`<div class="diary-session-summary"><span>${new Date(session.started_at).toLocaleString('it-IT')}</span><span>${Math.floor((Number(session.duration_seconds)||0)/60)} min</span></div>${(items||[]).length?(items||[]).map((item,i)=>{const exerciseSets=byItem.get(String(item.id))||[];return `<article class="diary-exercise-detail"><strong>${String(i+1).padStart(2,'0')} · ${escapeHtml(item.exercise_name||'Esercizio')}</strong>${exerciseSets.length?`<div class="diary-set-list">${exerciseSets.map(set=>`<span>Serie ${set.set_number}: <b>${Number(set.weight_kg)||0} kg</b> × <b>${Number(set.reps)||0}</b> rip. ${set.completed?'✓':''}</span>`).join('')}</div>`:'<p class="muted">Nessuna serie registrata.</p>'}</article>`;}).join(''):'<p class="muted">Non sono disponibili i dettagli degli esercizi per questa sessione.</p>'}<button class="diary-delete-session" type="button" data-delete-session="${session.id}">${TRASH_ICON} Elimina allenamento</button>`;
  wireDiaryDelete(el,session);
}
function wireDiaryDelete(el,session){el.querySelector('[data-delete-session]')?.addEventListener('click',async()=>{if(!confirm(`Eliminare definitivamente l’allenamento “${session.plan_name||'Allenamento'}”? La scheda originale resterà intatta.`))return;const btn=el.querySelector('[data-delete-session]');if(btn){btn.disabled=true;btn.textContent='Eliminazione…';}try{const {data:items,error:itemErr}=await supabase.from('session_exercises').select('id').eq('user_id',currentUser.id).eq('session_id',session.id);if(itemErr)throw itemErr;const ids=(items||[]).map(x=>x.id);if(ids.length){const {error:setErr}=await supabase.from('workout_sets').delete().eq('user_id',currentUser.id).in('session_exercise_id',ids);if(setErr)throw setErr;const {error:exErr}=await supabase.from('session_exercises').delete().eq('user_id',currentUser.id).eq('session_id',session.id);if(exErr)throw exErr;}const {error:sessionErr}=await supabase.from('workout_sessions').delete().eq('user_id',currentUser.id).eq('id',session.id);if(sessionErr)throw sessionErr;diarySessions=diarySessions.filter(s=>String(s.id)!==String(session.id));drawDiaryCalendar();await loadDashboardData();}catch(err){if(btn){btn.disabled=false;btn.innerHTML=`${TRASH_ICON} Riprova eliminazione`;}const p=document.createElement('p');p.className='status-message';p.textContent=`Non riesco a eliminare la sessione: ${err.message||err}`;el.append(p);}});}
async function loadSchedule() {
  const { data, error } = await supabase.from('scheduled_workouts').select('*').eq('user_id',currentUser.id).order('scheduled_at').limit(50);
  const el = $('scheduleList'); if (!el) return;
  if (error) { el.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`; return; }
  el.innerHTML = data.length ? data.map(s=>`<article><strong>${escapeHtml(s.title)}</strong><p>${new Date(s.scheduled_at).toLocaleString('it-IT')} · ${escapeHtml(s.status)}</p></article>`).join('') : '<p class="muted">Nessun allenamento programmato.</p>';
}
async function saveSchedule(e) {
  e.preventDefault();
  const { error } = await supabase.from('scheduled_workouts').insert({user_id:currentUser.id,title:$('scheduleTitle').value.trim(),scheduled_at:new Date($('scheduleAt').value).toISOString(),notes:$('scheduleNotes').value.trim() || null});
  if (error) { message('scheduleMessage',error.message,true); return; }
  $('scheduleForm').reset(); message('scheduleMessage','Allenamento aggiunto al calendario.'); await loadSchedule();
}
async function loadMetrics() {
  const { data, error } = await supabase.from('body_metrics').select('*').eq('user_id',currentUser.id).order('measured_at',{ascending:false}).limit(20);
  const el = $('metricList'); if (!el) return;
  if (error) { el.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`; return; }
  el.innerHTML = data.length ? data.map(m=>`<article><strong>${m.weight_kg ? escapeHtml(m.weight_kg)+' kg' : 'Misurazione'} · ${new Date(m.measured_at+'T12:00:00').toLocaleDateString('it-IT')}</strong><p>${[m.body_fat_percent != null ? m.body_fat_percent+'% grasso' : null,m.waist_cm != null ? 'Vita '+m.waist_cm+' cm':null,m.chest_cm != null ? 'Torace '+m.chest_cm+' cm':null].filter(Boolean).map(escapeHtml).join(' · ')}</p></article>`).join('') : '<p class="muted">Le tue misurazioni appariranno qui.</p>';
}
async function saveMetric(e) {
  e.preventDefault();
  const n = id => $(id).value === '' ? null : Number($(id).value);
  const { error } = await supabase.from('body_metrics').insert({user_id:currentUser.id,measured_at:$('metricDate').value,weight_kg:n('metricWeight'),body_fat_percent:n('metricFat'),chest_cm:n('metricChest'),waist_cm:n('metricWaist'),hips_cm:n('metricHips'),arm_cm:n('metricArm'),thigh_cm:n('metricThigh'),notes:$('metricNotes').value.trim() || null});
  if (error) { message('metricMessage',error.message,true); return; }
  message('metricMessage','Misurazione salvata.'); await loadMetrics(); await loadDashboardData();
}
function openPlansView() {
  activePlanForExercise=null;
  toolBackAction=()=>showDashboard();
  const cards=plans.length ? plans.map(p=>`<article class="plan-card" style="--plan-color:${escapeHtml(p.color||'#ff3038')}"><div class="plan-card-topline"><div class="plan-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h4"></path></svg></div><button class="plan-delete-icon" type="button" data-delete-plan="${p.id}" aria-label="Elimina la scheda ${escapeHtml(p.name)}" title="Elimina scheda">${TRASH_ICON}</button></div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||'Scheda personale')}</p><div class="plan-meta"><span>${escapeHtml((p.created_at?new Date(p.created_at):new Date()).toLocaleDateString('it-IT'))}</span><button type="button" data-open-plan="${p.id}">Apri scheda →</button></div></article>`).join(''):'<div class="empty-state"><span class="empty-icon">＋</span><h3>Ancora nessuna scheda</h3><p>Crea la tua prima scheda, poi aggiungi gli esercizi direttamente dal catalogo già integrato.</p></div>';
  openTool('Le mie schede', `<div class="page-intro"><p>Programmi personali e gruppi muscolari. Apri una scheda per aggiungere esercizi dal catalogo.</p></div><button id="addPlanFromList" class="primary-button" type="button">＋ Crea nuova scheda <span>→</span></button><div class="section-heading page-section-heading"><div><p class="eyebrow">I TUOI PROGRAMMI</p><h2>${plans.length} ${plans.length===1?'scheda salvata':'schede salvate'}</h2></div></div><div class="plans-grid">${cards}</div>`);
  $('addPlanFromList')?.addEventListener('click',openPlanDialog);
  $('toolContent').querySelectorAll('[data-open-plan]').forEach(btn=>btn.addEventListener('click',()=>openPlanDetails(plans.find(p=>p.id===btn.dataset.openPlan))));
  $('toolContent').querySelectorAll('[data-delete-plan]').forEach(btn=>btn.addEventListener('click',async()=>{const plan=plans.find(p=>p.id===btn.dataset.deletePlan);if(!plan)return;btn.disabled=true;await deleteWorkoutPlan(plan,true);}));
}
function openProfileView() {
  openTool('Profilo', `<div class="profile-panel page-profile"><div class="profile-mark"><img src="./logo-mark.png?v=18" alt="Marchesano Gym"></div><p class="eyebrow">AREA PERSONALE</p><h2>Il tuo percorso</h2><div class="profile-account-line"><span class="profile-avatar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5"></path></svg></span><span><small>Account collegato</small><strong>${escapeHtml(currentUser?.email || '—')}</strong></span></div><p class="muted">Gestisci i dati personali e monitora i cambiamenti del tuo corpo.</p><button id="profileMeasures" class="primary-button" type="button">Peso e misure <span>→</span></button><button id="profileCalendar" class="secondary-button profile-secondary" type="button">Calendario allenamenti →</button><button id="profileLogout" class="secondary-button profile-logout" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3"></path><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"></path></svg>Logout</button></div>`);
  $('profileMeasures')?.addEventListener('click',()=>openTool('Peso e misure'));
  $('profileCalendar')?.addEventListener('click',()=>openTool('Calendario'));
  $('profileLogout')?.addEventListener('click',async()=>{await supabase.auth.signOut();currentUser=null;showAuth();});
}
document.querySelectorAll('[data-tool]').forEach(btn=>btn.addEventListener('click',()=>openTool(({exercises:'Libreria esercizi',history:'Storico allenamenti',calendar:'Calendario',body:'Peso e misure'})[btn.dataset.tool])));
document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.action;
  if(action==='plans')openPlansView(); else if(action==='exercises')openExerciseLibrary(); else if(action==='history')openTool('Diario allenamenti'); else if(action==='profile')openProfileView();
}));
document.querySelectorAll('#bottomNav [data-nav]').forEach(btn=>btn.addEventListener('click',()=>{
  const nav=btn.dataset.nav;
  if(nav==='home'){activePlanForExercise=null;showDashboard();return;}
  if(nav==='plans'){openPlansView();return;}
  if(nav==='workout'){activePlanForExercise=null;openTool('Workout guidato');return;}
  if(nav==='exercises'){activePlanForExercise=null;openExerciseLibrary();return;}
  if(nav==='history'){activePlanForExercise=null;openTool('Diario allenamenti');return;}
  if(nav==='profile'){activePlanForExercise=null;openProfileView();return;}
}));
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js?v=25').catch(()=>{}));
window.addEventListener('pageshow', () => { if (currentUser) window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); });
loadApp();
