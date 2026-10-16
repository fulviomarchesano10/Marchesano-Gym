import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://dkghztezhnheblmfkvzn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bdpy-S_n7vltkHvmA6H9BA_EPB-nuqU';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
let isRegister = false;
let currentUser = null;
let plans = [];

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
  $('plansList').innerHTML = '';
  $('emptyPlans').classList.toggle('hidden', plans.length > 0);
  plans.forEach(plan => {
    const card = document.createElement('article');
    card.className = 'plan-card';
    card.style.setProperty('--plan-color', plan.color || '#D6FF42');
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
$('addPlanBtn').addEventListener('click', openPlanDialog);
$('emptyAddPlanBtn').addEventListener('click', openPlanDialog);
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
  $('toolContent').innerHTML = `<p class="muted">${escapeHtml(plan.description || 'Nessuna descrizione inserita.')}</p><div class="notice">Questa è la prima versione della scheda. Nel prossimo passaggio aggiungeremo la gestione degli esercizi, delle serie, delle ripetizioni, dei chili e dei tempi di recupero.</div><div style="height:14px"></div><button id="planAddExercise" class="primary-button">Aggiungi esercizi <span>→</span></button>`;
  $('toolContent').querySelector('#planAddExercise').addEventListener('click', () => openTool('Libreria esercizi', `<div class="notice">La libreria sarà collegata alle schede nel prossimo passaggio. Puoi già creare esercizi dalla sezione Libreria esercizi.</div><div style="height:12px"></div><button class="primary-button" id="createExerciseFromPlan">＋ Crea esercizio</button>`));
  $('toolDialog').showModal();
}
$('closeToolDialog').addEventListener('click', () => $('toolDialog').close());
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function openTool(tool, customContent = null) {
  $('toolTitle').textContent = tool;
  $('toolContent').innerHTML = customContent || '';
  if (!customContent) {
    if (tool === 'Libreria esercizi') {
      $('toolContent').innerHTML = `<form id="exerciseForm"><label>Nome esercizio<input id="exerciseName" required placeholder="Es. Panca piana bilanciere"></label><label>Gruppo muscolare<select id="exerciseMuscle"><option>Petto</option><option>Schiena</option><option>Spalle</option><option>Bicipiti</option><option>Tricipiti</option><option>Gambe</option><option>Addome</option><option>Cardio</option><option>Altro</option></select></label><label>Attrezzatura<input id="exerciseEquipment" placeholder="Bilanciere, manubri, cavi…"></label><label>Istruzioni<textarea id="exerciseInstructions" rows="2"></textarea></label><button class="primary-button" type="submit">Salva esercizio <span>→</span></button><p id="exerciseMessage" class="status-message"></p></form><div id="exerciseList" class="tool-list"></div>`;
      loadExercises();
      $('exerciseForm').addEventListener('submit', saveExercise);
    } else if (tool === 'Storico allenamenti') {
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
  $('toolDialog').showModal();
}
async function loadExercises() {
  const { data, error } = await supabase.from('exercises').select('*').eq('user_id', currentUser.id).order('name');
  const list = $('exerciseList'); if (!list) return;
  if (error) { list.innerHTML = `<p class="status-message">${escapeHtml(error.message)}</p>`; return; }
  list.innerHTML = data.length ? data.map(x=>`<article><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.muscle_group)}${x.equipment ? ' · '+escapeHtml(x.equipment):''}</p></article>`).join('') : '<p class="muted">Non hai ancora salvato esercizi.</p>';
}
async function saveExercise(e) {
  e.preventDefault();
  const payload = { user_id:currentUser.id, name:$('exerciseName').value.trim(), muscle_group:$('exerciseMuscle').value, equipment:$('exerciseEquipment').value.trim() || null, instructions:$('exerciseInstructions').value.trim() || null };
  const { error } = await supabase.from('exercises').insert(payload);
  if (error) { message('exerciseMessage', error.message, true); return; }
  $('exerciseForm').reset(); message('exerciseMessage','Esercizio salvato.'); await loadExercises();
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
document.querySelectorAll('[data-tool]').forEach(btn => btn.addEventListener('click', () => openTool(({exercises:'Libreria esercizi',history:'Storico allenamenti',calendar:'Calendario',body:'Peso e misure'})[btn.dataset.tool])));
document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b===btn));
  const navMap = {home:null,plans:null,exercises:'Libreria esercizi',history:'Storico allenamenti',body:'Peso e misure'};
  if (btn.dataset.nav==='home') { $('toolDialog').close(); return; }
  if (btn.dataset.nav==='plans') { $('toolDialog').close(); $('dashboardView').scrollIntoView({behavior:'smooth'}); $('plansList').scrollIntoView({behavior:'smooth',block:'center'}); return; }
  if (navMap[btn.dataset.nav]) openTool(navMap[btn.dataset.nav]);
}));
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
loadApp();
