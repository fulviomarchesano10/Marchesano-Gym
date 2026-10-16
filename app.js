import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://dkghztezhnheblmfkvzn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ2h6dGV6aG5oZWJsbWZrdnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzg3MDcsImV4cCI6MjEwNzcxNDcwN30.HYUi_VMGOe8oSUy02VOWqeeYsOuiyAZmhavFqQUJ-c0';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
let isRegister = false;
let currentUser = null;
let plans = [];

// Catalogo integrato Marchesano Gym: varianti comuni per gruppo muscolare e attrezzatura.
const EXERCISE_CATALOG = [{"name":"Panca piana bilanciere","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca piana manubri","muscle_group":"Petto","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca inclinata bilanciere","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca inclinata manubri","muscle_group":"Petto","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca declinata bilanciere","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca declinata manubri","muscle_group":"Petto","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Chest press macchina","muscle_group":"Petto","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Chest press convergente","muscle_group":"Petto","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca piana Smith machine","muscle_group":"Petto","equipment":"Smith machine","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca inclinata Smith machine","muscle_group":"Petto","equipment":"Smith machine","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Croci manubri panca piana","muscle_group":"Petto","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Croci manubri panca inclinata","muscle_group":"Petto","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Croci ai cavi alti","muscle_group":"Petto","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Croci ai cavi bassi","muscle_group":"Petto","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Croci ai cavi da sdraiato","muscle_group":"Petto","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pec deck / butterfly","muscle_group":"Petto","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Push-up classici","muscle_group":"Petto","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Push-up inclinati","muscle_group":"Petto","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Push-up declinati","muscle_group":"Petto","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Push-up con presa stretta","muscle_group":"Petto","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Dip alle parallele focus petto","muscle_group":"Petto","equipment":"Parallele","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pullover manubrio","muscle_group":"Petto","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Svend press","muscle_group":"Petto","equipment":"Disco","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Floor press bilanciere","muscle_group":"Petto","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Floor press manubri","muscle_group":"Petto","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Lat machine presa larga avanti","muscle_group":"Schiena","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Lat machine presa inversa","muscle_group":"Schiena","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Lat machine presa stretta","muscle_group":"Schiena","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Lat machine unilaterale","muscle_group":"Schiena","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Trazioni alla sbarra presa prona","muscle_group":"Schiena","equipment":"Sbarra","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Trazioni alla sbarra presa supina","muscle_group":"Schiena","equipment":"Sbarra","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Trazioni presa neutra","muscle_group":"Schiena","equipment":"Sbarra","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Rematore bilanciere","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Rematore Pendlay","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Rematore manubrio a un braccio","muscle_group":"Schiena","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Rematore manubri su panca inclinata","muscle_group":"Schiena","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Rematore T-bar","muscle_group":"Schiena","equipment":"T-bar","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Rematore macchina chest-supported","muscle_group":"Schiena","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pulley basso presa stretta","muscle_group":"Schiena","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pulley basso presa larga","muscle_group":"Schiena","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pulley unilaterale","muscle_group":"Schiena","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pulldown braccia tese ai cavi","muscle_group":"Schiena","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pullover ai cavi","muscle_group":"Schiena","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Stacco da terra convenzionale","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Stacco sumo","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Stacco rumeno","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Iperestensioni lombari","muscle_group":"Schiena","equipment":"Panca romana","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Back extension macchina","muscle_group":"Schiena","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Good morning","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Scrollate manubri","muscle_group":"Schiena","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Scrollate bilanciere","muscle_group":"Schiena","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Military press bilanciere","muscle_group":"Spalle","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Shoulder press manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Shoulder press macchina","muscle_group":"Spalle","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Arnold press","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Lento avanti Smith machine","muscle_group":"Spalle","equipment":"Smith machine","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Push press","muscle_group":"Spalle","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate laterali manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate laterali ai cavi","muscle_group":"Spalle","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate laterali macchina","muscle_group":"Spalle","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate laterali un braccio al cavo","muscle_group":"Spalle","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate frontali manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate frontali bilanciere","muscle_group":"Spalle","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Alzate frontali disco","muscle_group":"Spalle","equipment":"Disco","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Reverse fly manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Reverse pec deck","muscle_group":"Spalle","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Face pull","muscle_group":"Spalle","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Tirate al mento bilanciere","muscle_group":"Spalle","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Tirate al mento ai cavi","muscle_group":"Spalle","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Y-raise su panca inclinata","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Cuban rotation manubri","muscle_group":"Spalle","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl bilanciere dritto","muscle_group":"Bicipiti","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl bilanciere EZ","muscle_group":"Bicipiti","equipment":"Bilanciere EZ","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl manubri alternato","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl manubri simultaneo","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl martello","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl martello ai cavi","muscle_group":"Bicipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl panca Scott bilanciere EZ","muscle_group":"Bicipiti","equipment":"Panca Scott","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl panca Scott manubrio","muscle_group":"Bicipiti","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl concentrato","muscle_group":"Bicipiti","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl ai cavi bassi","muscle_group":"Bicipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl ai cavi con barra","muscle_group":"Bicipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl al cavo singolo","muscle_group":"Bicipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Curl inclinato manubri","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Spider curl","muscle_group":"Bicipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Drag curl bilanciere","muscle_group":"Bicipiti","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Chin-up presa supina","muscle_group":"Bicipiti","equipment":"Sbarra","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pushdown tricipiti barra","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pushdown tricipiti corda","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pushdown presa inversa","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"French press bilanciere EZ","muscle_group":"Tricipiti","equipment":"Bilanciere EZ","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"French press manubri","muscle_group":"Tricipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Estensioni sopra la testa al cavo","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Estensioni sopra la testa manubrio","muscle_group":"Tricipiti","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Skull crusher panca piana","muscle_group":"Tricipiti","equipment":"Bilanciere EZ","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Skull crusher manubri","muscle_group":"Tricipiti","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Dip alle parallele focus tricipiti","muscle_group":"Tricipiti","equipment":"Parallele","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Panca presa stretta","muscle_group":"Tricipiti","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Kickback manubrio","muscle_group":"Tricipiti","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Kickback ai cavi","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Estensioni tricipiti un braccio al cavo","muscle_group":"Tricipiti","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Squat bilanciere high bar","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Squat bilanciere low bar","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Front squat","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Goblet squat","muscle_group":"Gambe","equipment":"Manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Hack squat macchina","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg press 45 gradi","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg press orizzontale","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Smith machine squat","muscle_group":"Gambe","equipment":"Smith machine","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Bulgarian split squat manubri","muscle_group":"Gambe","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Affondi in camminata","muscle_group":"Gambe","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Affondi indietro","muscle_group":"Gambe","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Affondi frontali","muscle_group":"Gambe","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Step-up con manubri","muscle_group":"Gambe","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg extension","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg curl sdraiato","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg curl seduto","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg curl in piedi","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Stacco rumeno manubri","muscle_group":"Gambe","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Stacco gambe tese bilanciere","muscle_group":"Gambe","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Hip hinge con kettlebell","muscle_group":"Gambe","equipment":"Kettlebell","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Adductor machine","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Abductor machine","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Sissy squat","muscle_group":"Gambe","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pistol squat assistito","muscle_group":"Gambe","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Wall sit","muscle_group":"Gambe","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Nordic hamstring curl","muscle_group":"Gambe","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Reverse Nordic curl","muscle_group":"Gambe","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg press a una gamba","muscle_group":"Gambe","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Hip thrust bilanciere","muscle_group":"Glutei","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Hip thrust macchina","muscle_group":"Glutei","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Glute bridge a terra","muscle_group":"Glutei","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Glute bridge con bilanciere","muscle_group":"Glutei","equipment":"Bilanciere","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Kickback glutei ai cavi","muscle_group":"Glutei","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Kickback glutei macchina","muscle_group":"Glutei","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Abduzioni anca ai cavi","muscle_group":"Glutei","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Abduzioni anca da sdraiato","muscle_group":"Glutei","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Frog pump","muscle_group":"Glutei","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pull-through ai cavi","muscle_group":"Glutei","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Step-up focus glutei","muscle_group":"Glutei","equipment":"Panca e manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Back extension focus glutei","muscle_group":"Glutei","equipment":"Panca romana","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Calf raise in piedi macchina","muscle_group":"Polpacci","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Calf raise seduto","muscle_group":"Polpacci","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Calf raise alla leg press","muscle_group":"Polpacci","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Calf raise con manubri","muscle_group":"Polpacci","equipment":"Manubri","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Calf raise su gradino a corpo libero","muscle_group":"Polpacci","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Calf raise donkey","muscle_group":"Polpacci","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Crunch a terra","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Crunch ai cavi","muscle_group":"Addome","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Crunch macchina","muscle_group":"Addome","equipment":"Macchina","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Reverse crunch","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Sit-up","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Leg raise alla sbarra","muscle_group":"Addome","equipment":"Sbarra","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Knee raise alla sbarra","muscle_group":"Addome","equipment":"Sbarra","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Plank","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Side plank","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Ab wheel rollout","muscle_group":"Addome","equipment":"Ruota addominali","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Dead bug","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Pallof press","muscle_group":"Addome","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Russian twist","muscle_group":"Addome","equipment":"Disco o manubrio","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Woodchopper ai cavi","muscle_group":"Addome","equipment":"Cavi","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Mountain climber","muscle_group":"Addome","equipment":"Corpo libero","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Tapis roulant camminata","muscle_group":"Cardio","equipment":"Tapis roulant","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Tapis roulant corsa","muscle_group":"Cardio","equipment":"Tapis roulant","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Cyclette","muscle_group":"Cardio","equipment":"Cyclette","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Bicicletta ellittica","muscle_group":"Cardio","equipment":"Ellittica","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Vogatore","muscle_group":"Cardio","equipment":"Vogatore","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Air bike","muscle_group":"Cardio","equipment":"Air bike","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Salto con la corda","muscle_group":"Cardio","equipment":"Corda","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Ski erg","muscle_group":"Cardio","equipment":"Ski erg","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Sled push","muscle_group":"Cardio","equipment":"Slitta","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."},{"name":"Battle rope","muscle_group":"Cardio","equipment":"Corde","instructions":"Esegui il movimento con controllo, postura stabile e ampiezza confortevole. Interrompi se senti dolore."}];


function message(id, text, error = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = text || '';
  el.style.color = error ? '#ff7773' : '';
}
function showAuth() {
  $('authView').classList.remove('hidden');
  $('dashboardView').classList.add('hidden');
  $('bottomNav').classList.add('hidden');
  $('logoutBtn').classList.add('hidden');
}
function showDashboard() {
  $('authView').classList.add('hidden');
  $('dashboardView').classList.remove('hidden');
  $('bottomNav').classList.remove('hidden');
  $('logoutBtn').classList.remove('hidden');
  $('todayLabel').textContent = new Intl.DateTimeFormat('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date());
  document.documentElement.style.scrollBehavior = 'auto'; requestAnimationFrame(() => { window.scrollTo(0,0); document.body.scrollTop = 0; });
}
function setAuthMode() {
  $('authTitle').textContent = isRegister ? 'Crea il tuo account' : 'Bentornato';
  $('authSubtitle').textContent = isRegister ? 'Un account personale per i tuoi allenamenti.' : 'Accedi per continuare il tuo percorso.';
  $('authSubmit').innerHTML = isRegister ? 'Registrati <span>→</span>' : 'Accedi <span>→</span>';
  $('toggleAuth').textContent = isRegister ? 'Hai già un account? Accedi' : 'Non hai ancora un account? Registrati';
  $('password').autocomplete = isRegister ? 'new-password' : 'current-password';
}
$('toggleAuth').addEventListener('click', () => { isRegister = !isRegister; message('authMessage',''); setAuthMode(); });
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
    message('authMessage','');
    await loadApp();
  } catch (err) {
    message('authMessage', err.message || 'Operazione non riuscita.', true);
  } finally {
    $('authSubmit').disabled = false;
  }
});
$('logoutBtn').addEventListener('click', async () => { await supabase.auth.signOut(); currentUser = null; showAuth(); });
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
$('startWorkoutBtn').addEventListener('click', () => {
  if (!plans.length) { openPlanDialog(); return; }
  openTool('Workout guidato', `<div class="notice">Il database è pronto per le schede. Nel prossimo passaggio collegheremo gli esercizi alle schede e costruiremo la schermata guidata con serie, carichi e timer di recupero.</div><div class="tool-list">${plans.map(p=>`<article><strong>${escapeHtml(p.name)}</strong><p>${escapeHtml(p.description || 'Scheda personale')}</p><button class="secondary-button" data-plan="${p.id}">Seleziona scheda</button></article>`).join('')}</div>`);
  $('toolContent').querySelectorAll('[data-plan]').forEach(btn => btn.addEventListener('click', () => openPlanDetails(plans.find(p=>p.id===btn.dataset.plan))));
});
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
  $('toolTitle').textContent = plan.name;
  $('toolContent').innerHTML = `<p class="muted">${escapeHtml(plan.description || 'Scheda personale')}</p>
    <div class="plan-exercises" id="planExerciseList"><p class="muted">Caricamento esercizi della scheda…</p></div>
    <button id="planAddExercise" class="primary-button" type="button">＋ Aggiungi esercizi <span>→</span></button>`;
  $('planAddExercise').addEventListener('click', () => openExerciseLibrary(plan));
  if (!$('toolDialog').open) $('toolDialog').showModal();
  loadPlanExercises(plan);
}
$('closeToolDialog').addEventListener('click', () => $('toolDialog').close());
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function openTool(tool, customContent = null) {
  if (tool === 'Libreria esercizi' && !customContent) { openExerciseLibrary(); return; }
  $('toolTitle').textContent = tool;
  $('toolContent').innerHTML = customContent || '';
  if (!customContent) {
    if (tool === 'Storico allenamenti') {
      $('toolContent').innerHTML = '<div id="historyList" class="tool-list"><p class="muted">Caricamento storico…</p></div>';
      loadHistory();
    } else if (tool === 'Calendario') {
      $('toolContent').innerHTML = `<form id="scheduleForm"><label>Nome allenamento<input id="scheduleTitle" required placeholder="Es. Petto / Spalle / Tricipiti"></label><label>Data e ora<input id="scheduleAt" type="datetime-local" required></label><label>Note<textarea id="scheduleNotes" rows="2"></textarea></label><button class="primary-button" type="submit">Aggiungi al calendario <span>→</span></button><p id="scheduleMessage" class="status-message"></p></form><div id="scheduleList" class="tool-list"></div>`;
      loadSchedule();
      $('scheduleForm').addEventListener('submit', saveSchedule);
    } else if (tool === 'Peso e misure') {
      $('toolContent').innerHTML = `<form id="bodyForm"><label>Data<input id="metricDate" type="date" required></label><div class="small-form"><label>Peso (kg)<input id="metricWeight" type="number" step="0.1" min="1" placeholder="74.0"></label><label>Grasso (%)<input id="metricFat" type="number" step="0.1" min="0" max="100" placeholder="Facoltativo"></label></div><div class="small-form"><label>Torace (cm)<input id="metricChest" type="number" step="0.1" min="1"></label><label>Vita (cm)<input id="metricWaist" type="number" step="0.1" min="1"></label></div><div class="small-form"><label>Fianchi (cm)<input id="metricHips" type="number" step="0.1" min="1"></label><label>Braccio (cm)<input id="metricArm" type="number" step="0.1" min="1"></label></div><label>Coscia (cm)<input id="metricThigh" type="number" step="0.1" min="1"></label><label>Note<textarea id="metricNotes" rows="2"></textarea></label><button class="primary-button" type="submit">Salva misurazione <span>→</span></button><p id="metricMessage" class="status-message"></p></form><div id="metricList" class="tool-list"></div>`;
      $('metricDate').value = new Date().toISOString().slice(0,10);
      loadMetrics();
      $('bodyForm').addEventListener('submit', saveMetric);
    } else {
      $('toolContent').innerHTML = '<div class="notice">Sezione in preparazione. Le funzioni verranno collegate progressivamente al database.</div>';
    }
  }
  if (!$('toolDialog').open) $('toolDialog').showModal();
}

let activePlanForExercise = null;
let exerciseTab = 'catalog';
function openExerciseLibrary(plan = null) {
  activePlanForExercise = plan;
  exerciseTab = 'catalog';
  $('toolTitle').textContent = plan ? `Aggiungi esercizi · ${plan.name}` : 'Libreria esercizi';
  $('toolContent').innerHTML = `
    <p class="muted">Catalogo integrato con ${EXERCISE_CATALOG.length} esercizi e varianti. Cerca per nome, gruppo muscolare o attrezzatura.</p>
    <div class="exercise-toolbar">
      <input id="catalogSearch" type="search" placeholder="Cerca: panca inclinata, curl, squat…" aria-label="Cerca esercizi">
      <select id="catalogMuscle" aria-label="Filtra per gruppo muscolare"><option value="">Tutti i gruppi muscolari</option>${[...new Set(EXERCISE_CATALOG.map(x=>x.muscle_group))].sort().map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select>
      <select id="catalogEquipment" aria-label="Filtra per attrezzatura"><option value="">Tutta l'attrezzatura</option>${[...new Set(EXERCISE_CATALOG.map(x=>x.equipment))].sort().map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select>
    </div>
    <div class="exercise-actions"><button id="toggleCustomExercise" class="secondary-button" type="button">＋ Crea esercizio personalizzato</button><button id="showMyExercises" class="secondary-button" type="button">I miei esercizi</button><button id="loadOnlineCatalog" class="secondary-button" type="button">Carica catalogo online</button></div>
    <form id="exerciseForm" class="hidden"><label>Nome esercizio<input id="exerciseName" required placeholder="Es. Panca piana bilanciere"></label><label>Gruppo muscolare<select id="exerciseMuscle">${[...new Set(EXERCISE_CATALOG.map(x=>x.muscle_group))].sort().map(x=>`<option>${escapeHtml(x)}</option>`).join('')}<option>Altro</option></select></label><label>Attrezzatura<input id="exerciseEquipment" placeholder="Bilanciere, manubri, cavi…"></label><label>Istruzioni<textarea id="exerciseInstructions" rows="2"></textarea></label><button class="primary-button" type="submit">Salva esercizio <span>→</span></button><p id="exerciseMessage" class="status-message"></p></form>
    <p id="catalogMessage" class="status-message" role="status"></p><div id="exerciseList" class="tool-list"></div>
    <p class="catalog-credit">Catalogo integrato Marchesano Gym. Per ampliare la ricerca è disponibile anche il database pubblico wger; i dati importati vengono salvati nel tuo account.</p>`;
  $('catalogSearch').addEventListener('input', renderExerciseCatalog);
  $('catalogMuscle').addEventListener('change', renderExerciseCatalog);
  $('catalogEquipment').addEventListener('change', renderExerciseCatalog);
  $('toggleCustomExercise').addEventListener('click', () => $('exerciseForm').classList.toggle('hidden'));
  $('showMyExercises').addEventListener('click', loadExercises);
  $('loadOnlineCatalog').addEventListener('click', loadOnlineExerciseCatalog);
  $('exerciseForm').addEventListener('submit', saveExercise);
  renderExerciseCatalog();
  if (!$('toolDialog').open) $('toolDialog').showModal();
}
async function loadOnlineExerciseCatalog() {
  const button = $('loadOnlineCatalog');
  const status = $('catalogMessage');
  if (!button || !status) return;
  button.disabled = true; button.textContent = 'Caricamento catalogo…';
  message('catalogMessage', 'Sto consultando il catalogo pubblico wger. Può richiedere qualche secondo…');
  try {
    let offset = 0, total = Infinity, loaded = 0;
    const online = [];
    while (offset < total && offset < 1200) {
      const response = await fetch(`https://wger.de/api/v2/exerciseinfo/?format=json&limit=100&offset=${offset}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Il catalogo online ha risposto con errore ${response.status}.`);
      const page = await response.json();
      total = Number(page.count) || 0;
      const results = Array.isArray(page.results) ? page.results : [];
      if (!results.length) break;
      for (const entry of results) {
        const translations = Array.isArray(entry.translations) ? entry.translations : [];
        const italian = translations.find(t => (t.language?.short_name || t.language?.shortName || '').toLowerCase() === 'it') || translations.find(t => t.language === 12) || translations[0];
        const name = (italian?.name || '').trim();
        if (!name) continue;
        const rawCategory = typeof entry.category === 'object' ? entry.category?.name : '';
        const categoryMap = { chest:'Petto', back:'Schiena', shoulders:'Spalle', arms:'Bicipiti', legs:'Gambe', abs:'Addome', cardio:'Cardio', glutes:'Glutei', calves:'Polpacci' };
        const categoryName = String(rawCategory || '').toLowerCase();
        const group = categoryMap[categoryName] || (['Petto','Schiena','Spalle','Bicipiti','Tricipiti','Gambe','Glutei','Polpacci','Addome','Cardio'].includes(rawCategory) ? rawCategory : 'Altro');
        const equipment = Array.isArray(entry.equipment) ? entry.equipment.map(e => typeof e === 'object' ? e.name : '').filter(Boolean).join(', ') : '';
        online.push({ name, muscle_group: group, equipment: equipment || 'Attrezzatura varia', instructions: '' , source: 'wger' });
      }
      loaded += results.length;
      offset += results.length;
      if (!page.next) break;
    }
    const seen = new Set(EXERCISE_CATALOG.map(x => x.name.toLocaleLowerCase('it')));
    let added = 0;
    for (const item of online) {
      const key = item.name.toLocaleLowerCase('it');
      if (!seen.has(key)) { EXERCISE_CATALOG.push(item); seen.add(key); added++; }
    }
    EXERCISE_CATALOG.sort((a,b)=>a.name.localeCompare(b.name,'it'));
    renderExerciseCatalog();
    message('catalogMessage', `Catalogo online consultato: ${loaded} voci esaminate, ${added} nuovi esercizi aggiunti alla ricerca. Se alcuni nomi sono in inglese, puoi comunque cercarli e salvarli.`);
  } catch (err) {
    message('catalogMessage', `${err.message || 'Impossibile raggiungere il catalogo online.'} Il catalogo integrato di ${EXERCISE_CATALOG.length} esercizi resta disponibile.`, true);
  } finally {
    button.disabled = false; button.textContent = 'Carica catalogo online';
  }
}
function renderExerciseCatalog() {
  const list = $('exerciseList'); if (!list) return;
  const q = ($('catalogSearch')?.value || '').trim().toLocaleLowerCase('it');
  const muscle = $('catalogMuscle')?.value || '';
  const equipment = $('catalogEquipment')?.value || '';
  const rows = EXERCISE_CATALOG.filter(x => (!muscle || x.muscle_group === muscle) && (!equipment || x.equipment === equipment) && (!q || `${x.name} ${x.muscle_group} ${x.equipment}`.toLocaleLowerCase('it').includes(q)));
  if (!rows.length) { list.innerHTML = '<p class="muted">Nessun esercizio trovato. Prova un termine diverso o crea un esercizio personalizzato.</p>'; return; }
  list.innerHTML = rows.map((x,i) => `<article class="exercise-card"><div><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.muscle_group)} · ${escapeHtml(x.equipment)}</p></div><button class="exercise-add-button" type="button" data-catalog-index="${EXERCISE_CATALOG.indexOf(x)}">${activePlanForExercise ? 'Aggiungi alla scheda' : 'Aggiungi ai miei esercizi'} <span>＋</span></button></article>`).join('');
  list.querySelectorAll('[data-catalog-index]').forEach(btn => btn.addEventListener('click', async () => {
    const item = EXERCISE_CATALOG[Number(btn.dataset.catalogIndex)];
    btn.disabled = true; btn.textContent = 'Salvataggio…';
    try {
      const saved = await ensureUserExercise(item);
      if (activePlanForExercise) await addExerciseToPlan(activePlanForExercise, saved);
      message('catalogMessage', activePlanForExercise ? `${item.name} aggiunto alla scheda.` : `${item.name} aggiunto ai tuoi esercizi.`);
      if (activePlanForExercise) await loadPlanExercises(activePlanForExercise);
    } catch (err) { message('catalogMessage', err.message || 'Impossibile salvare l’esercizio.', true); }
    finally { btn.disabled = false; btn.innerHTML = `${activePlanForExercise ? 'Aggiungi alla scheda' : 'Aggiungi ai miei esercizi'} <span>＋</span>`; }
  }));
}
async function ensureUserExercise(item) {
  if (!currentUser) throw new Error('Accedi per salvare gli esercizi.');
  const { data: existing, error: findError } = await supabase.from('exercises').select('*').eq('user_id', currentUser.id).eq('name', item.name).limit(1);
  if (findError) throw findError;
  if (existing?.length) return existing[0];
  const payload = { user_id: currentUser.id, name: item.name, muscle_group: item.muscle_group, equipment: item.equipment || null, instructions: item.instructions || null };
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
async function loadPlanExercises(plan) {
  const el = $('planExerciseList'); if (!el) return;
  const { data: rows, error } = await supabase.from('plan_exercises').select('*').eq('user_id', currentUser.id).eq('plan_id', plan.id).order('sort_order');
  if (error) { el.innerHTML = `<p class="status-message">${escapeHtml(error.message)}. Se la tabella non ha le colonne previste, applica il file SQL incluso nel pacchetto.</p>`; return; }
  if (!rows?.length) { el.innerHTML = '<div class="empty-state"><h3>Nessun esercizio ancora</h3><p>Tocca “Aggiungi esercizi” e scegli dal catalogo. Ogni esercizio partirà da 3 serie, 10 ripetizioni e 90 secondi di recupero, modificabili in seguito.</p></div>'; return; }
  const ids = rows.map(x=>x.exercise_id).filter(Boolean);
  const { data: exercises, error: exError } = await supabase.from('exercises').select('id,name,muscle_group,equipment').eq('user_id',currentUser.id).in('id',ids);
  if (exError) { el.innerHTML = `<p class="status-message">${escapeHtml(exError.message)}</p>`; return; }
  const map = new Map((exercises||[]).map(x=>[x.id,x]));
  el.innerHTML = rows.map((r,idx)=>{const x=map.get(r.exercise_id); if(!x) return ''; return `<article class="exercise-card plan-exercise-card"><div><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.muscle_group||'')} · ${escapeHtml(x.equipment||'')}</p><small>${Number(r.sets)||3} serie × ${Number(r.reps)||10} ripetizioni · recupero ${Number(r.rest_seconds)||90}s</small></div><button class="remove-exercise-button" type="button" data-remove-plan-exercise="${r.id}" aria-label="Rimuovi ${escapeHtml(x.name)}">×</button></article>`}).join('');
  el.querySelectorAll('[data-remove-plan-exercise]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;const {error}=await supabase.from('plan_exercises').delete().eq('id',btn.dataset.removePlanExercise).eq('user_id',currentUser.id);if(error){message('catalogMessage',error.message,true);btn.disabled=false;return;}await loadPlanExercises(plan);}));
}
async function loadExercises() {
  const list = $('exerciseList'); if (!list || !currentUser) return;
  list.innerHTML = '<p class="muted">Caricamento dei tuoi esercizi…</p>';
  const { data, error } = await supabase.from('exercises').select('*').eq('user_id', currentUser.id).order('name');
  if (!list.isConnected) return;
  if (error) { list.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`; return; }
  if (!data?.length) { list.innerHTML = '<p class="muted">Non hai ancora esercizi personali salvati. Scegli dal catalogo oppure creane uno personalizzato.</p>'; return; }
  list.innerHTML = `<p class="eyebrow">I TUOI ESERCIZI · ${data.length}</p>` + data.map(x=>`<article class="exercise-card"><div><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.muscle_group||'Altro')}${x.equipment ? ' · '+escapeHtml(x.equipment):''}</p></div>${activePlanForExercise ? `<button class="exercise-add-button" type="button" data-user-exercise="${x.id}">Aggiungi alla scheda ＋</button>`:''}</article>`).join('');
  list.querySelectorAll('[data-user-exercise]').forEach(btn=>btn.addEventListener('click',async()=>{const item=data.find(x=>x.id===btn.dataset.userExercise);if(!item)return;btn.disabled=true;try{await addExerciseToPlan(activePlanForExercise,item);message('catalogMessage',`${item.name} aggiunto alla scheda.`);await loadPlanExercises(activePlanForExercise);}catch(err){message('catalogMessage',err.message,true);}finally{btn.disabled=false;}}));
}
async function saveExercise(e) {
  e.preventDefault();
  if (!currentUser) { message('exerciseMessage','Accedi per salvare un esercizio.',true); return; }
  const payload = { user_id:currentUser.id, name:$('exerciseName').value.trim(), muscle_group:$('exerciseMuscle').value, equipment:$('exerciseEquipment').value.trim() || null, instructions:$('exerciseInstructions').value.trim() || null };
  if (!payload.name) { message('exerciseMessage','Inserisci il nome dell’esercizio.',true); return; }
  const submit = $('exerciseForm').querySelector('[type="submit]'); if (submit) submit.disabled = true;
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
async function loadHistory() {
  const { data, error } = await supabase.from('workout_sessions').select('*').eq('user_id',currentUser.id).order('started_at',{ascending:false}).limit(50);
  const el = $('historyList'); if (!el) return;
  if (error) { el.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`; return; }
  el.innerHTML = data.length ? data.map(s=>`<article><strong>${escapeHtml(s.plan_name)}</strong><p>${new Date(s.started_at).toLocaleString('it-IT')} · ${escapeHtml(s.status)}</p></article>`).join('') : '<p class="muted">Gli allenamenti completati appariranno qui.</p>';
}
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
  const cards = plans.length ? plans.map(p => `<article class="plan-card" style="--plan-color:${escapeHtml(p.color || '#ff3038')}"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || 'Scheda personale')}</p><div class="plan-meta"><span>SCHEDA PERSONALE</span><button type="button" data-open-plan="${p.id}">Apri →</button></div></article>`).join('') : '<div class="empty-state"><span class="empty-icon">＋</span><h3>Ancora nessuna scheda</h3><p>Crea la tua prima scheda e organizza il tuo allenamento.</p></div>';
  openTool('Le mie schede', `<button id="addPlanFromList" class="primary-button" type="button">＋ Crea nuova scheda <span>→</span></button><div style="height:14px"></div><div class="plans-grid modal-plans">${cards}</div>`);
  $('addPlanFromList')?.addEventListener('click', openPlanDialog);
  $('toolContent').querySelectorAll('[data-open-plan]').forEach(btn => btn.addEventListener('click', () => openPlanDetails(plans.find(p => p.id === btn.dataset.openPlan))));
}
function openProfileView() {
  openTool('Profilo', `<div class="profile-panel"><div class="profile-mark"><img src="./icons/logo-mark.png?v=3" alt="Marchesano Gym"></div><h3>Il tuo percorso</h3><p class="muted">Gestisci i dati personali e monitora i cambiamenti del tuo corpo.</p><button id="profileMeasures" class="primary-button" type="button">Peso e misure <span>→</span></button><button id="profileCalendar" class="secondary-button profile-secondary" type="button">Calendario allenamenti →</button><button id="profileLogout" class="text-button" type="button">Esci dal tuo account</button></div>`);
  $('profileMeasures')?.addEventListener('click', () => openTool('Peso e misure'));
  $('profileCalendar')?.addEventListener('click', () => openTool('Calendario'));
  $('profileLogout')?.addEventListener('click', async () => { await supabase.auth.signOut(); currentUser = null; $('toolDialog').close(); showAuth(); });
}
document.querySelectorAll('[data-tool]').forEach(btn => btn.addEventListener('click', () => openTool(({exercises:'Libreria esercizi',history:'Storico allenamenti',calendar:'Calendario',body:'Peso e misure'})[btn.dataset.tool])));
document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
  const action = btn.dataset.action;
  if (action === 'plans') openPlansView();
  else if (action === 'exercises') openTool('Libreria esercizi');
  else if (action === 'history') openTool('Storico allenamenti');
  else if (action === 'profile') openProfileView();
}));
document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('#bottomNav [data-nav]').forEach(b=>b.classList.toggle('active',b===btn));
  const nav = btn.dataset.nav;
  if (nav === 'home') { if ($('toolDialog').open) $('toolDialog').close(); window.scrollTo({top:0,behavior:'auto'}); return; }
  if (nav === 'plans') { openPlansView(); return; }
  if (nav === 'workout') { if ($('toolDialog').open) $('toolDialog').close(); $('startWorkoutBtn').click(); return; }
  if (nav === 'exercises') { openTool('Libreria esercizi'); return; }
  if (nav === 'history') { openTool('Storico allenamenti'); return; }
  if (nav === 'profile') { openProfileView(); return; }
  if (nav === 'body') openTool('Peso e misure');
}));
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
window.addEventListener('pageshow', () => { if (currentUser) window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); });
loadApp();
