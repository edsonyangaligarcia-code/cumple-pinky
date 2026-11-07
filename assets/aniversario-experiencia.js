
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const ASSET = 'assets/aniversario/';
  const RELEASE = Date.parse('2026-11-08T00:00:00-05:00');
  const preview = new URLSearchParams(location.search).get('preview') === '1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const two = n => String(n).padStart(2,'0');
  const go = id => $(id).scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block:'start'});

  let toastTimer;
  function toast(text){
    $('toast').textContent = text;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2800);
  }

  function confetti(amount = 48){
    if(reduced.matches) return;
    const colors = ['#6f1020','#8e1b2f','#d9b57b','#f4ebc8','#fffdf7'];
    for(let i=0;i<amount;i++){
      const c = document.createElement('i');
      c.className = 'confetti';
      c.setAttribute('aria-hidden','true');
      c.style.left = Math.random()*100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--drift',(Math.random()*230-115)+'px');
      c.style.animationDuration = (2.4 + Math.random()*1.8) + 's';
      document.body.append(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  function decorate(){
    const chars = ['❤️','♡','✦','🌼','🌷'];
    for(let i=0;i<18;i++){
      const el = document.createElement('span');
      el.className = 'floater';
      el.textContent = chars[i % chars.length];
      el.style.left = Math.random()*100 + '%';
      el.style.fontSize = (14 + Math.random()*15) + 'px';
      el.style.animationDuration = (9 + Math.random()*8) + 's';
      el.style.animationDelay = (-Math.random()*13) + 's';
      $('floaters').append(el);
    }
  }

  let unlocked = false;
  function unlock(){
    if(unlocked) return;
    unlocked = true;
    $('gate').hidden = true;
    $('experience').hidden = false;
    if(preview && window.top === window.self) $('vistaEtiqueta').hidden = false;
    decorate();
    setTimeout(() => confetti(55), 350);
  }

  function tick(){
    const remaining = RELEASE - Date.now();
    if(preview || remaining <= 0){ unlock(); return true; }
    const s = Math.ceil(remaining/1000);
    $('dd').textContent = two(Math.floor(s/86400));
    $('hh').textContent = two(Math.floor((s%86400)/3600));
    $('mm').textContent = two(Math.floor((s%3600)/60));
    $('ss').textContent = two(s%60);
    return false;
  }

  if(!tick()){
    const clock = setInterval(() => { if(tick()) clearInterval(clock); }, 1000);
  }

  $('start').addEventListener('click', () => { confetti(60); go('recuerdos'); });

  const photos = [
    ['Nosotros abrazados','Me encanta esta foto contigo. No estábamos haciendo nada especial, pero yo estaba a tu lado y eso me bastaba para ser feliz.'],
    ['Tú, vista desde la ventana de la cocina','Te tomé esta foto desde la ventana de la cocina. Me gustaba mirarte, incluso en un día cualquiera.'],
    ['Tú descansando en mi pecho','Aquí te quedaste dormida en mi pecho. Yo no necesitaba nada más: tenerte así, cerca de mí, me hacía feliz.'],
    ['Nuestros pies junto al agua en Obrajillo','¿Te acuerdas de nuestro primer viaje a Obrajillo? Caminamos una hora bajo el sol y terminamos metiendo los pies al agua. Me encanta recordar ese día contigo.'],
    ['La torta de nuestro primer aniversario','Nuestro primer aniversario, el 8 de noviembre de 2024. Me hace sonreír volver a ver cómo celebramos ese día juntos.'],
    ['Tú durante uno de nuestros paseos','Me gusta volver a esta foto tuya. A veces te miraba y pensaba en lo feliz que era de compartir esos días contigo.'],
    ['Nosotros pasando el tiempo juntos','Esta foto me recuerda que no necesitábamos hacer grandes planes. Yo la pasaba bien con solo estar cerca de ti.'],
    ['Tú riéndote en el momento de tus medias','Todavía me río cuando recuerdo que tus medias tenían un hueco, jajaja. Me encantaba pasarla así contigo, riéndonos de cualquier cosa.'],
    ['Tú y yo con mi hermano y su pareja','Aquí estamos tú y yo con mi hermano y su pareja. Me gusta tener este recuerdo de los cuatro juntos y de ti a mi lado.'],
    ['Tú con tu peluche de Snoopy','También quise guardar esta foto tuya con Snoopy. Me gusta mirarla porque me hace pensar en ti.'],
    ['Tú con las flores que hice a mano','Esas flores las hice a mano para ti. Quería empezar esta sorpresa con una foto así, porque me gusta mucho cómo te ves aquí.'],
    ['Nosotros acostados en mi cama','Me encantaba estar acostado contigo en mi cama. Aunque no hiciéramos nada, estar a tu lado convertía ese día en mi mejor día.']
  ];

  let photoIndex = 5;
  function renderPhoto(){
    const [alt, caption] = photos[photoIndex];
    const image = $('memoryPhoto');
    image.src = ASSET + 'foto-' + two(photoIndex+1) + '.jpg';
    image.alt = alt;
    $('photoCaption').textContent = caption;
  }
  function changePhoto(delta){ photoIndex = (photoIndex + delta + photos.length) % photos.length; renderPhoto(); }
  renderPhoto();
  $('previousPhoto').addEventListener('click', () => changePhoto(-1));
  $('nextPhoto').addEventListener('click', () => changePhoto(1));
  $('photoViewer').addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
      e.preventDefault();
      changePhoto(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let pointerX = null, swiped = false;
  $('photoViewer').addEventListener('pointerdown', e => { pointerX = e.clientX; swiped = false; });
  $('photoViewer').addEventListener('pointerup', e => {
    if(pointerX !== null && Math.abs(e.clientX-pointerX) > 55){
      swiped = true;
      changePhoto(e.clientX < pointerX ? 1 : -1);
    }
    pointerX = null;
  });
  $('photoViewer').addEventListener('pointercancel', () => { pointerX = null; });

  const mediaDialog = $('mediaDialog');
  let activeVideo = null;
  let activeURL = null;
  let mediaToken = 0;
  function lockScroll(){ document.body.style.overflow = 'hidden'; }
  function unlockScroll(){ if(!mediaDialog.open && !$('letterDialog').open) document.body.style.overflow = ''; }
  function clearMedia(){
    mediaToken++;
    if(activeVideo){ activeVideo.pause(); activeVideo.removeAttribute('src'); activeVideo.load(); activeVideo = null; }
    if(activeURL){ URL.revokeObjectURL(activeURL); activeURL = null; }
    $('mediaBody').replaceChildren();
  }
  function showMedia(title, caption){
    clearMedia();
    $('mediaTitle').textContent = title;
    $('mediaCaption').textContent = caption;
    mediaDialog.showModal();
    lockScroll();
  }
  function imageModal(src,title,caption,alt){
    showMedia(title,caption);
    const image = new Image();
    image.src = src;
    image.alt = alt;
    $('mediaBody').append(image);
  }
  $('photoOpen').addEventListener('click', () => {
    if(swiped){ swiped = false; return; }
    imageModal($('memoryPhoto').src,'Me gusta recordar esto contigo',photos[photoIndex][1],photos[photoIndex][0]);
  });
  $('closeMedia').addEventListener('click', () => mediaDialog.close());
  mediaDialog.addEventListener('close', () => { clearMedia(); unlockScroll(); });

  const parts = {1:4,2:2,3:2,4:5,5:2,6:1,7:4,8:2,9:3};
  async function readPart(name){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try{
      const response = await fetch(ASSET + name, {signal: controller.signal});
      if(!response.ok) throw Error('HTTP ' + response.status);
      const bytes = await response.arrayBuffer();
      if(bytes.byteLength <= 792) throw Error('Medio incompleto');
      return bytes.slice(792);
    } finally { clearTimeout(timeout); }
  }

  const videos = [
    {n:1,icon:'🎂',title:'Mi cumpleaños contigo',text:'Ese 29 de julio en el Parque de las Aguas fue uno de mis mejores cumpleaños. La pasé muy bonito a tu lado y me encanta volver a vernos así.'},
    {n:2,icon:'😘',title:'Cuando te despedía',text:'Así te despedía en la estación Flores. Nos mandábamos besos a la distancia y yo me quedaba mirándote hasta que te ibas.'},
    {n:3,icon:'❤️',title:'Nuestro primer aniversario',text:'El 8 de noviembre de 2024 celebramos nuestro primer aniversario en mi cuarto de Balta. Me gusta volver a ese momento contigo.'},
    {n:4,icon:'😂',title:'Cuando no querías dormir conmigo',text:'Aquí no querías dormir conmigo, jajaja. Me acuerdo de cómo la pasábamos y no puedo evitar sonreír al volver a verlo.'},
    {n:5,icon:'🌴',title:'Cuando corrimos a nuestra palmera',text:'Faltaban diez minutos para tu cumpleaños del 21 de septiembre de 2024 y corrimos hacia nuestra palmera, donde nos dimos nuestro primer beso. Llegamos a tiempo. Esa noche contigo la guardo con mucho cariño.'},
    {n:6,icon:'☺️',title:'Así me hacías feliz',text:'Aquí yo era feliz contigo. No necesitaba que pasara nada extraordinario para querer guardar este momento.'},
    {n:7,icon:'🤍',title:'Un día contigo',text:'Me gusta verme así, pasando el tiempo a tu lado. Para mí, estar contigo ya hacía que el día valiera la pena.'},
    {n:8,icon:'😄',title:'Cómo me hacías reír',text:'Me encantaba reírme contigo y pasarla así. Volver a ver este video me devuelve a una de esas veces en las que simplemente era feliz a tu lado.'},
    {n:9,icon:'🌊',title:'Caminar contigo por la playa',text:'Esta caminata de noche por la playa fue un momento hermoso contigo. Me gustaba caminar a tu lado y compartir esa tranquilidad.'}
  ];

  async function openVideo(item,sourceButton){
    $('voiceAudio').pause();
    showMedia(item.title,item.text);
    const token = mediaToken;
    const video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'metadata';
    video.poster = ASSET + 'poster-' + two(item.n) + '.jpg';
    video.setAttribute('aria-label',item.title);
    activeVideo = video;
    const status = document.createElement('p');
    status.className = 'media-status';
    status.setAttribute('role','status');
    const retry = document.createElement('button');
    retry.className = 'btn soft retry';
    retry.textContent = 'Volver a cargar';
    retry.hidden = true;
    $('mediaBody').append(video,status,retry);
    let loading = false;
    async function load(){
      if(loading || token !== mediaToken) return;
      loading = true;
      retry.hidden = true;
      status.textContent = 'Abriendo este recuerdo…';
      try{
        const chunks = await Promise.all(Array.from({length: parts[item.n]}, (_,k) => readPart('v' + two(item.n) + '-p' + two(k+1) + '.jpg')));
        if(token !== mediaToken || !mediaDialog.open) return;
        if(activeURL) URL.revokeObjectURL(activeURL);
        activeURL = URL.createObjectURL(new Blob(chunks,{type:'video/mp4'}));
        video.src = activeURL;
        status.textContent = '';
        await video.play().catch(() => { status.textContent = 'Pulsa reproducir para ver el video.'; });
      } catch(error){
        if(token === mediaToken){ status.textContent = 'No se pudo abrir el video. Puedes volver a cargarlo.'; retry.hidden = false; }
      } finally { loading = false; }
    }
    video.addEventListener('playing', () => {
      if(sourceButton) sourceButton.classList.add('opened');
      status.textContent = '';
    });
    video.addEventListener('error', () => { if(token === mediaToken){ status.textContent = 'No se pudo reproducir. Prueba de nuevo.'; retry.hidden = false; } });
    retry.addEventListener('click', load);
    load();
  }

  videos.forEach(item => {
    const b = document.createElement('button');
    b.className = 'open-btn'; b.type = 'button';
    const icon = document.createElement('span');
    icon.className = 'emo'; icon.setAttribute('aria-hidden','true'); icon.textContent = item.icon;
    b.append(icon, document.createTextNode(item.title));
    b.addEventListener('click', () => openVideo(item,b));
    $('videoGrid').append(b);
  });
  // Un solo botón para la final: el reproductor solo aparece si el archivo existe.
  // La vista pública no presenta controles que lleven a un vídeo inexistente.
  (async function prepareChampionshipVideo(){
    const videoPath=ASSET+'final-campeonato.mp4?v=20261107-h264-mobile';
    const slot=$('championshipVideo');
    if(!slot) return;
    try{
      const response=await fetch(videoPath,{method:'HEAD',cache:'no-store'});
      if(!response.ok){
        // Solo en vista previa mostramos qué archivo falta; nunca en la sorpresa pública.
        if(preview){
          const pending=document.createElement('p');
          pending.className='media-status';
          pending.textContent='Vista previa: falta subir el video de esta final.';
          slot.append(pending);
          slot.hidden=false;
        }
        return;
      }
      const button=document.createElement('button');
      button.type='button';
      button.className='btn';
      button.textContent='▶ Ver el video de aquella final';
      button.setAttribute('aria-label','Ver el video de la final del campeonato');
      button.addEventListener('click', () => {
        $('voiceAudio').pause();
        showMedia('Aquella final, contigo ❤️','Quise guardar también esta final, porque tenerte a mi lado fue lo más especial. ❤️');
        const token=mediaToken;
        const video=document.createElement('video');
        video.controls=true;
        video.playsInline=true;
        video.setAttribute('playsinline','');
        video.setAttribute('webkit-playsinline','');
        video.preload='metadata';
        video.setAttribute('aria-label','La final del campeonato, junto a ti');
        video.src=videoPath;
        activeVideo=video;
        const status=document.createElement('p');
        status.className='media-status';
        status.setAttribute('role','status');
        status.textContent='Preparando el video…';
        const direct=document.createElement('a');
        direct.href=videoPath;
        direct.target='_blank';
        direct.rel='noopener noreferrer';
        direct.className='media-open-direct';
        direct.textContent='¿No ves la imagen? Abrir video directamente';
        $('mediaBody').append(video,status,direct);
        video.addEventListener('loadeddata', () => { if(token===mediaToken) status.textContent=''; });
        video.addEventListener('playing', () => { if(token===mediaToken) status.textContent=''; });
        video.addEventListener('waiting', () => { if(token===mediaToken) status.textContent='Cargando el video…'; });
        video.addEventListener('error', () => { if(token===mediaToken) status.textContent='No se pudo reproducir aquí. Prueba abrir el video directamente.'; });
        video.play().catch(() => {
          if(token===mediaToken && video.paused) status.textContent='Pulsa reproducir para ver el video.';
        });
      });
      slot.append(button);
      slot.hidden=false;
    }catch(error){
      // Sin archivo o sin conexión, no alteramos la dedicatoria ni el contador.
    }
  })();

  $('revealDrawingNote').addEventListener('click', () => {
    const note = $('drawingNote');
    const opened = note.hidden;
    note.hidden = !opened;
    $('revealDrawingNote').textContent = opened ? 'Ocultar mi mensaje 💌' : 'Leer mi mensaje para ti 💌';
    if(opened) confetti(20);
  });

  function drawing(){
    imageModal(ASSET + 'dibujo.jpg','Lo dibujé pensando en ti','Tal vez no salió perfecto, pero sí salió con muchísimo cariño para ti.','El retrato que dibujé para ti');
  }
  $('drawingOpen').addEventListener('click', drawing);
  $('drawingZoom').addEventListener('click', drawing);

  const voice = $('voiceAudio');
  let voiceLoading = false, voiceURL = null;
  $('voiceButton').addEventListener('click', async () => {
    if(voiceLoading) return;
    if(!voice.paused){ voice.pause(); return; }
    if(activeVideo) activeVideo.pause();
    if(!voice.getAttribute('src')){
      voiceLoading = true;
      $('voiceButton').disabled = true;
      $('voiceStatus').textContent = 'Abriendo mi grabación…';
      try{
        const bytes = await readPart('voz-p01.jpg');
        voiceURL = URL.createObjectURL(new Blob([bytes],{type:'audio/mp4'}));
        voice.src = voiceURL;
      } catch(error){
        $('voiceStatus').textContent = 'No se pudo abrir. Toca reproducir para reintentar.';
        voiceLoading = false; $('voiceButton').disabled = false;
        return;
      }
      voiceLoading = false;
      $('voiceButton').disabled = false;
    }
    voice.play().catch(() => { $('voiceStatus').textContent = 'Pulsa reproducir en los controles del audio.'; });
  });
  voice.addEventListener('playing', () => {
    if(activeVideo) activeVideo.pause();
    $('disc').classList.add('playing');
    $('voiceButton').textContent = '❚❚';
    $('voiceButton').setAttribute('aria-label','Pausar mi mensaje de voz');
    $('voiceStatus').textContent = 'Mi voz, para ti. ❤️';
  });
  function pauseVoice(){
    $('disc').classList.remove('playing');
    $('voiceButton').textContent = '▶';
    $('voiceButton').setAttribute('aria-label','Reproducir mi mensaje de voz');
    $('voiceStatus').textContent = voice.ended ? 'Puedes volver a escucharme cuando quieras.' : 'En pausa. Puedes seguir escuchando cuando quieras.';
  }
  voice.addEventListener('pause', pauseVoice);
  voice.addEventListener('ended', pauseVoice);
  voice.addEventListener('error', () => {
    $('voiceStatus').textContent = 'No se pudo reproducir. Toca el botón para reintentar.';
    voice.removeAttribute('src');
    if(voiceURL){ URL.revokeObjectURL(voiceURL); voiceURL = null; }
  });

  $('revealLettersNote').addEventListener('click', () => {
    $('lettersNote').hidden = false;
    $('revealLettersNote').hidden = true;
    confetti(18);
  });

  let letterIndex = 0, openingLetter = false;
  const letterDialog = $('letterDialog');
  function renderLetter(){
    const src = ASSET + 'carta-' + two(letterIndex+1) + '.jpg';
    $('letterImage').src = src;
    $('fullLetter').href = src;
    $('previousLetter').disabled = letterIndex === 0;
    $('nextLetter').textContent = letterIndex === 6 ? 'Cerrar mis cartas ♡' : 'Seguir leyendo →';
    $('paperScroll').scrollTo(0,0);
    $('letterImage').classList.remove('paper-turn'); void $('letterImage').offsetWidth; $('letterImage').classList.add('paper-turn');
  }
  $('envelope').addEventListener('click', () => {
    if(openingLetter) return;
    openingLetter = true;
    $('envelope').classList.add('opened');
    $('envelopeHint').textContent = 'Estas cartas las escribí de todo corazón para ti.';
    setTimeout(() => {
      letterIndex = 0;
      renderLetter();
      letterDialog.showModal();
      lockScroll();
      openingLetter = false;
    }, reduced.matches ? 0 : 850);
  });
  $('closeLetter').addEventListener('click', () => letterDialog.close());
  letterDialog.addEventListener('close', () => {
    $('envelope').classList.remove('opened');
    $('envelopeHint').textContent = 'Puedes volver a leerme cuando quieras. ❤️';
    unlockScroll();
  });
  $('previousLetter').addEventListener('click', () => { if(letterIndex > 0){ letterIndex--; renderLetter(); } });
  $('nextLetter').addEventListener('click', () => { if(letterIndex < 6){ letterIndex++; renderLetter(); } else { letterDialog.close(); } });
  $('zoomLetter').addEventListener('click', () => {
    const zoom = $('paperScroll').classList.toggle('zoomed');
    $('zoomLetter').setAttribute('aria-pressed', String(zoom));
    $('zoomLetter').textContent = zoom ? 'Ver la página completa' : 'Ampliar la letra';
  });

  for(const dialog of [mediaDialog, letterDialog]){
    dialog.addEventListener('click', e => {
      if(e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  }

  addEventListener('pagehide', e => {
    voice.pause();
    if(e.persisted) return;
    clearMedia();
    if(voiceURL) URL.revokeObjectURL(voiceURL);
  });
})();