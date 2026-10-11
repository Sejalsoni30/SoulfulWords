/* ============================================================
   SHAYRI — MEMORIES THAT NEVER FADE
   Application Logic, SPA Router, Interactive Effects & State
============================================================ */

/* ============================================================
   SEED DATA
============================================================ */
var SEED = [
  { id: 's1',  lang: 'english', emoji: '🌙', text: '"The night keeps its secrets well,\nbut the heart reveals them all —\nin the silence of a sleepless dawn."', author: 'Anonymous', mood: 'night',      gc: 'gc1', likes: 24 },
  { id: 's2',  lang: 'english', emoji: '🥀', text: '"Some names are not forgotten,\nthey are simply hidden —\nunder layers of unspoken tears."',             author: 'Shayra',    mood: 'pain',       gc: 'gc2', likes: 41 },
  { id: 's3',  lang: 'english', emoji: '✨', text: '"Even the stars grow tired\nof hearing the same old prayers —\nyet they shine, just for you."',           author: 'Riya',      mood: 'hope',       gc: 'gc3', likes: 18 },
  { id: 's4',  lang: 'english', emoji: '💌', text: '"I wrote your name on water,\nhoping the waves would carry\nmy longing to your shore."',                  author: 'Zara',      mood: 'longing',    gc: 'gc1', likes: 36 },
  { id: 's5',  lang: 'english', emoji: '🕯️', text: '"A candle does not mourn\nthe darkness it destroys —\nit simply burns, and loves."',                     author: 'Aryan',     mood: 'love',       gc: 'gc2', likes: 29 },
  { id: 's6',  lang: 'english', emoji: '🌹', text: '"Even wilted roses\nhold the fragrance of\na love that once was real."',                                 author: 'Meera',     mood: 'love',       gc: 'gc3', likes: 52 },
  { id: 's7',  lang: 'hindi',   emoji: '🌿', text: 'तेरी याद आती है जब रात गहरी होती है,\nआंखें बंद करूं तो तस्वीर तेरी होती है।',                             author: 'Rahul',     mood: 'memories',   gc: 'gc1', likes: 67 },
  { id: 's8',  lang: 'hindi',   emoji: '💔', text: 'दर्द को छुपाना मैंने सीख लिया,\nपर तुझे भूलना नहीं सीख पाया।',                                             author: 'Priya',     mood: 'pain',       gc: 'gc2', likes: 88 },
  { id: 's9',  lang: 'hindi',   emoji: '🌙', text: 'रात के सन्नाटे में तेरा नाम लेता हूं,\nसितारों को गवाह मानकर तुझे याद करता हूं।',                         author: 'Kavya',     mood: 'night',      gc: 'gc3', likes: 43 },
  { id: 's10', lang: 'hindi',   emoji: '🥀', text: 'तू मिला था जिंदगी बनकर,\nबिछड़ा तो दर्द की कहानी बनकर।',                                                 author: 'Dev',       mood: 'longing',    gc: 'gc1', likes: 59 },
  { id: 's11', lang: 'english', emoji: '🌊', text: '"Distance is just a test\nto see how far love can travel —\nand mine has crossed every ocean."',          author: 'Ananya',    mood: 'love',       gc: 'gc2', likes: 33 },
  { id: 's12', lang: 'hindi',   emoji: '🍃', text: 'उम्मीद का दीया जलाए रखना,\nअंधेरों में भी मुस्कुराए रखना।',                                               author: 'Sona',      mood: 'hope',       gc: 'gc3', likes: 21 },
];

/* ============================================================
   FIREBASE CLOUD FIRESTORE INITIALIZATION
============================================================ */
var firebaseConfig = {
  apiKey: "AIzaSyAOTRAuoCWlTMSxXUr1Ze7gNsu3ItwuC3c",
  authDomain: "soulmatewords-1b474.firebaseapp.com",
  projectId: "soulmatewords-1b474",
  storageBucket: "soulmatewords-1b474.firebasestorage.app",
  messagingSenderId: "469339484488",
  appId: "1:469339484488:web:1071d1ad881928701e837d"
};

var db = null;
var firestoreShayris = [];
var isFirestoreOnline = false;

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("🔥 Firebase initialized for project:", firebaseConfig.projectId);
  }
} catch (e) {
  console.warn("Firebase initialization notice:", e);
}

/* ============================================================
   STATE & STORAGE
============================================================ */
var currentPage   = 'home';
var selectedLang  = 'english';
var selectedMood  = null;
var activeFilter  = 'all';
var likedSet      = JSON.parse(localStorage.getItem('shayri_liked') || '[]');
var userShayris   = JSON.parse(localStorage.getItem('shayri_user')  || '[]');

function updateDbStatus(online, text) {
  var pill = document.getElementById('dbStatusBadge');
  var txt = document.getElementById('dbStatusText');
  if (!pill) return;
  if (online) {
    pill.classList.remove('offline');
    pill.classList.add('connected');
  } else {
    pill.classList.remove('connected');
    pill.classList.add('offline');
  }
  if (txt) txt.textContent = text || (online ? '🔥 Cloud Firestore Live' : '🌿 Local Storage Mode');
}

function initFirestoreListener() {
  if (!db) {
    updateDbStatus(false, '🌿 Local Storage Mode (Offline / Standalone)');
    return;
  }

  try {
    updateDbStatus(false, '⏳ Connecting to Firestore...');
    db.collection('shayris').onSnapshot(function(snapshot) {
      isFirestoreOnline = true;
      var count = snapshot.docs.length;
      updateDbStatus(true, '🔥 Cloud Firestore Live (' + count + ' community ' + (count === 1 ? 'poem' : 'poems') + ')');

      var list = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        var createdTime = 0;
        if (data.createdAt) {
          if (data.createdAt.toMillis) {
            createdTime = data.createdAt.toMillis();
          } else if (typeof data.createdAt === 'number') {
            createdTime = data.createdAt;
          } else if (typeof data.createdAt === 'string') {
            createdTime = new Date(data.createdAt).getTime() || 0;
          }
        }

        list.push({
          id: doc.id,
          lang: data.lang || 'english',
          emoji: data.emoji || '🌙',
          text: data.text || '',
          author: data.author || 'Anonymous Poet',
          mood: data.mood || 'love',
          gc: data.gc || 'gc1',
          likes: typeof data.likes === 'number' ? data.likes : 0,
          createdAt: createdTime,
          isFirestore: true
        });
      });

      // Sort newest poems first
      list.sort(function(a, b) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      firestoreShayris = list;
      if (currentPage === 'explore') {
        renderGrid(activeFilter);
      }

      // Auto-sync previously saved local shayris now that Firestore rules are active
      if (userShayris && userShayris.length > 0) {
        syncLocalShayrisToCloud();
      }
    }, function(err) {
      console.warn("Firestore snapshot listener:", err.message);
      isFirestoreOnline = false;
      var msg = '🌿 Local Mode (Offline)';
      if (err.code === 'permission-denied') {
        msg = '⚠️ Firestore Rules Locked (Read blocked)';
      }
      updateDbStatus(false, msg);
    });
  } catch (err) {
    console.warn("Firestore listener error:", err);
    updateDbStatus(false, '🌿 Local Mode');
  }
}

var isSyncingLocal = false;
function syncLocalShayrisToCloud() {
  if (!db || !isFirestoreOnline || isSyncingLocal) return;
  if (!userShayris || userShayris.length === 0) return;

  isSyncingLocal = true;
  console.log("☁️ Auto-syncing " + userShayris.length + " local shayri(s) to Cloud Firestore...");

  var itemsToSync = userShayris.slice();
  var syncPromises = itemsToSync.map(function(item) {
    var payload = {
      lang: item.lang || 'english',
      emoji: item.emoji || '🌙',
      text: item.text,
      author: item.author || 'Anonymous Poet',
      mood: item.mood || 'love',
      gc: item.gc || 'gc1',
      likes: typeof item.likes === 'number' ? item.likes : 0,
      createdAt: (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue)
        ? firebase.firestore.FieldValue.serverTimestamp()
        : Date.now()
    };

    return db.collection('shayris').add(payload)
      .then(function(docRef) {
        console.log("Synced local shayri to Firestore ID:", docRef.id);
        var idx = userShayris.findIndex(function(x) { return x.id === item.id; });
        if (idx > -1) {
          userShayris.splice(idx, 1);
        }
      });
  });

  Promise.all(syncPromises)
    .then(function() {
      localStorage.setItem('shayri_user', JSON.stringify(userShayris));
      showToast('☁️ Saved poem synced to Cloud Firestore!');
      isSyncingLocal = false;
      var guide = document.getElementById('rulesGuideBanner');
      if (guide) guide.style.display = 'none';
    })
    .catch(function(err) {
      console.warn("Auto-sync notice:", err);
      isSyncingLocal = false;
    });
}

function getAllShayris() {
  var combined = [];
  var seenIds = {};

  // 1. Cloud Firestore live submissions first
  firestoreShayris.forEach(function(s) {
    if (!seenIds[s.id]) {
      seenIds[s.id] = true;
      combined.push(s);
    }
  });

  // 2. Local user submissions
  userShayris.forEach(function(s) {
    if (!seenIds[s.id]) {
      seenIds[s.id] = true;
      combined.push(s);
    }
  });

  // 3. Featured seed poems
  SEED.forEach(function(s) {
    if (!seenIds[s.id]) {
      seenIds[s.id] = true;
      combined.push(s);
    }
  });

  return combined;
}

/* ============================================================
   NAVIGATION (SPA ROUTER)
============================================================ */
function navigate(page) {
  // hide current page
  var old = document.getElementById('page-' + currentPage);
  if (old) { old.classList.remove('active'); }

  // update nav buttons
  ['home', 'explore', 'about'].forEach(function(p) {
    var btn = document.getElementById('nb-' + p);
    if (btn) btn.classList.remove('active');
  });

  currentPage = page;
  var newPage = document.getElementById('page-' + page);
  if (newPage) {
    newPage.classList.add('active');
    window.scrollTo(0, 0);
  }

  var activeBtn = document.getElementById('nb-' + page);
  if (activeBtn) activeBtn.classList.add('active');

  if (page === 'explore') renderGrid(activeFilter);
  if (page === 'submit')  resetForm();
  initReveal();
}

/* ============================================================
   EXPLORE — RENDER GRID & FILTERS
============================================================ */
function renderGrid(filter) {
  activeFilter = filter;

  // update filter buttons
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  var all = getAllShayris();
  var filtered = all.filter(function(s) {
    if (filter === 'all')     return true;
    if (filter === 'english') return s.lang === 'english';
    if (filter === 'hindi')   return s.lang === 'hindi';
    return s.mood === filter;
  });

  var grid = document.getElementById('shayriGrid');
  grid.innerHTML = '';

  if (!filtered.length) {
    grid.innerHTML = '<div class="no-results">🌙 No shayri found for this mood yet.<br/><small>Be the first to add one!</small></div>';
    return;
  }

  filtered.forEach(function(s) {
    var liked  = likedSet.indexOf(s.id) > -1;
    var isUser = s.isFirestore || (s.id && s.id.startsWith('u'));
    var lines  = s.text.split('\n').join('<br/>');
    var card   = document.createElement('div');
    card.className = 's-card ' + (s.gc || 'gc1') + (isUser ? ' user-card' : '') + ' reveal';
    card.dataset.id = s.id;
    card.innerHTML = [
      '<div style="display:flex;align-items:center;flex-wrap:wrap;margin-bottom:0.8rem;">',
        '<span class="s-card-lang ' + (s.lang === 'hindi' ? 'hindi' : '') + '" style="margin-bottom:0;">' + (s.lang === 'hindi' ? '🇮🇳 Hindi' : '🇬🇧 English') + '</span>',
        (s.isFirestore ? '<span class="s-card-cloud" title="Synced in Cloud Firestore">☁️ Firestore</span>' : ''),
      '</div>',
      '<span class="s-card-emoji">' + s.emoji + '</span>',
      '<p class="s-card-text' + (s.lang === 'hindi' ? ' hindi-text' : '') + '">' + lines + '</p>',
      '<div class="s-card-footer">',
        '<div>',
          '<div class="s-card-author">✍️ ' + (s.author || 'Anonymous') + '</div>',
          '<div class="s-card-tag">' + moodLabel(s.mood) + '</div>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:.4rem;">',
          '<span style="font-size:.78rem;color:rgba(167,243,208,.6);" id="lc-' + s.id + '">' + (s.likes || 0) + '</span>',
          '<button class="s-card-like ' + (liked ? 'liked' : '') + '" id="lb-' + s.id + '" onclick="toggleLike(\'' + s.id + '\')" title="Like">💚</button>',
        '</div>',
      '</div>',
    ].join('');
    grid.appendChild(card);
  });

  setTimeout(initReveal, 50);
}

function moodLabel(mood) {
  var map = {
    love:       '💚 Love',
    pain:       '💔 Pain',
    night:      '🌙 Night',
    longing:    '🥀 Longing',
    hope:       '🍃 Hope',
    memories:   '🕯️ Memories',
    happiness:  '🌿 Peace',
    separation: '💫 Separation'
  };
  return map[mood] || '✨ ' + (mood || 'Shayri');
}

/* ============================================================
   LIKE SYSTEM
============================================================ */
function toggleLike(id) {
  var idx = likedSet.indexOf(id);
  var all = getAllShayris();
  var s   = all.filter(function(x) { return x.id === id; })[0];
  if (!s) return;

  var btn = document.getElementById('lb-' + id);
  var cnt = document.getElementById('lc-' + id);

  if (idx > -1) {
    likedSet.splice(idx, 1);
    s.likes = Math.max(0, (s.likes || 1) - 1);
    if (btn) {
      btn.classList.remove('liked');
      btn.style.transform = '';
    }
  } else {
    likedSet.push(id);
    s.likes = (s.likes || 0) + 1;
    if (btn) {
      btn.classList.add('liked');
      btn.style.transform = 'scale(1.4)';
      setTimeout(function() { btn.style.transform = ''; }, 300);
    }
  }

  if (cnt) cnt.textContent = s.likes;
  localStorage.setItem('shayri_liked', JSON.stringify(likedSet));

  // Sync likes with Firestore if cloud item
  if (s.isFirestore && db) {
    var delta = (idx === -1) ? 1 : -1;
    db.collection('shayris').doc(id).update({
      likes: firebase.firestore.FieldValue.increment(delta)
    }).catch(function(err) {
      console.warn("Could not sync like to Firestore:", err);
    });
  } else {
    // persist user shayris in localStorage
    var ui = userShayris.findIndex(function(x) { return x.id === id; });
    if (ui > -1) {
      userShayris[ui].likes = s.likes;
      localStorage.setItem('shayri_user', JSON.stringify(userShayris));
    }
  }
}

/* ============================================================
   FILTER BAR EVENT
============================================================ */
var filterBarEl = document.getElementById('filterBar');
if (filterBarEl) {
  filterBarEl.addEventListener('click', function(e) {
    var btn = e.target.closest('.filter-btn');
    if (btn) renderGrid(btn.dataset.filter);
  });
}

/* ============================================================
   SUBMIT FORM
============================================================ */
function setLang(lang) {
  selectedLang = lang;
  var enBtn = document.getElementById('langEn');
  var hiBtn = document.getElementById('langHi');
  if (enBtn) enBtn.classList.toggle('active', lang === 'english');
  if (hiBtn) hiBtn.classList.toggle('active', lang === 'hindi');

  var ta = document.getElementById('shayriText');
  if (ta) {
    if (lang === 'hindi') {
      ta.classList.add('hindi-input');
      ta.placeholder = 'अपनी शायरी यहाँ लिखें...';
    } else {
      ta.classList.remove('hindi-input');
      ta.placeholder = 'Write your shayri here...';
    }
  }
}

// Mood chips
var moodGridEl = document.getElementById('moodGrid');
if (moodGridEl) {
  moodGridEl.addEventListener('click', function(e) {
    var chip = e.target.closest('.mood-chip');
    if (!chip) return;
    document.querySelectorAll('.mood-chip').forEach(function(c) { c.classList.remove('selected'); });
    chip.classList.add('selected');
    selectedMood = chip.dataset.mood;
  });
}

// Char counter
var shayriTextEl = document.getElementById('shayriText');
if (shayriTextEl) {
  shayriTextEl.addEventListener('input', function() {
    var charCountEl = document.getElementById('charCount');
    if (charCountEl) charCountEl.textContent = this.value.length + ' / 500';
  });
}

function resetForm() {
  var authorEl = document.getElementById('authorName');
  var textEl   = document.getElementById('shayriText');
  var charEl   = document.getElementById('charCount');
  var emojiEl  = document.getElementById('shayriEmoji');
  var bannerEl = document.getElementById('successBanner');

  if (authorEl) authorEl.value = '';
  if (textEl)   textEl.value = '';
  if (charEl)   charEl.textContent = '0 / 500';
  if (emojiEl)  emojiEl.value = '🌙';
  document.querySelectorAll('.mood-chip').forEach(function(c) { c.classList.remove('selected'); });
  selectedMood = null;
  if (bannerEl) bannerEl.classList.remove('visible');
  setLang('english');
}

function submitShayri() {
  var authorInput = document.getElementById('authorName');
  var textInput   = document.getElementById('shayriText');
  var emojiInput  = document.getElementById('shayriEmoji');

  var author = (authorInput && authorInput.value.trim()) || 'Anonymous Poet';
  var text   = textInput ? textInput.value.trim() : '';
  var emoji  = emojiInput ? emojiInput.value : '🌙';

  if (!text) {
    if (textInput) {
      textInput.focus();
      textInput.style.borderColor = 'rgba(239, 68, 68, 0.7)';
      setTimeout(function() { textInput.style.borderColor = ''; }, 2000);
    }
    return;
  }
  if (!selectedMood) {
    showToast('💔 Please pick a mood for your shayri!');
    return;
  }

  var gcs = ['gc1', 'gc2', 'gc3'];
  var newS = {
    lang:   selectedLang,
    emoji:  emoji,
    text:   text,
    author: author,
    mood:   selectedMood,
    gc:     gcs[Math.floor(Math.random() * 3)],
    likes:  0
  };

  var submitBtn = document.getElementById('submitBtn');
  var origBtnText = submitBtn ? submitBtn.innerHTML : '✨ Publish My Shayri';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Saving to Cloud Firestore...';
  }

  function handleComplete(isCloud, note) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnText;
    }
    var successBanner = document.getElementById('successBanner');
    if (successBanner) {
      successBanner.classList.add('visible');
      var p = successBanner.querySelector('p');
      if (p) {
        p.textContent = isCloud
          ? 'Saved directly to Cloud Firestore! Visible worldwide.'
          : 'Saved in local storage. (' + (note || 'Offline mode') + ')';
      }
    }
    showToast(isCloud ? '🔥 Published to Cloud Firestore!' : '🌿 Published locally!');

    if (isCloud) {
      var guide = document.getElementById('rulesGuideBanner');
      if (guide) guide.style.display = 'none';
    }

    if (textInput) textInput.value = '';
    if (authorInput) authorInput.value = '';
    var charCountEl = document.getElementById('charCount');
    if (charCountEl) charCountEl.textContent = '0 / 500';
    document.querySelectorAll('.mood-chip').forEach(function(c) { c.classList.remove('selected'); });
    selectedMood = null;

    burstAt(window.innerWidth / 2, window.innerHeight / 2);
  }

  // Attempt to write to Cloud Firestore
  if (db) {
    var firestorePayload = Object.assign({}, newS, {
      createdAt: (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue)
        ? firebase.firestore.FieldValue.serverTimestamp()
        : Date.now()
    });

    db.collection('shayris').add(firestorePayload)
      .then(function(docRef) {
        console.log("Shayri published to Firestore document:", docRef.id);
        handleComplete(true);
      })
      .catch(function(err) {
        console.warn("Firestore save failed, falling back to local storage:", err);
        newS.id = 'u' + Date.now();
        userShayris.unshift(newS);
        localStorage.setItem('shayri_user', JSON.stringify(userShayris));

        // If permission error, show in-app guide
        if (err.code === 'permission-denied' || (err.message && err.message.indexOf('permissions') > -1)) {
          var guide = document.getElementById('rulesGuideBanner');
          if (guide) {
            guide.style.display = 'block';
            guide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }

        handleComplete(false, err.code === 'permission-denied' ? 'Firestore Security Rules deny write' : err.message);
      });
  } else {
    // Local storage fallback
    newS.id = 'u' + Date.now();
    userShayris.unshift(newS);
    localStorage.setItem('shayri_user', JSON.stringify(userShayris));
    handleComplete(false, 'Local offline mode');
  }
}

function copyFirebaseRules() {
  var rulesText = "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(rulesText).then(function() {
      var btn = document.getElementById('copyRulesBtn');
      if (btn) {
        btn.textContent = '✅ Copied to Clipboard!';
        setTimeout(function() { btn.textContent = '📋 Copy Rules to Clipboard'; }, 2500);
      }
      showToast('📋 Rules copied! Paste in Firebase Console.');
    });
  } else {
    showToast('Please copy the rules shown in the box above.');
  }
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}

/* ============================================================
   STARS CANVAS (EMERALD NIGHT SKY)
============================================================ */
var canvas = document.getElementById('stars-canvas');
var ctx    = canvas ? canvas.getContext('2d') : null;
var stars  = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  if (!canvas) return;
  stars = [];
  for (var i = 0; i < 200; i++) {
    stars.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      off:   Math.random() * Math.PI * 2
    });
  }
}

function drawStars(t) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(function(s) {
    var tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.off));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(215, 255, 235, ' + (tw * s.alpha) + ')';
    ctx.fill();

    if (s.r > 1.2) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52, 211, 153, ' + (tw * s.alpha * 0.22) + ')';
      ctx.fill();
    }
  });
}

function animStars(ts) {
  drawStars(ts / 1000);
  requestAnimationFrame(animStars);
}

if (canvas) {
  window.addEventListener('resize', function() {
    resizeCanvas();
    initStars();
  });
  resizeCanvas();
  initStars();
  requestAnimationFrame(animStars);
}

/* ============================================================
   FLOATING NATURE & POETRY EMOJIS
============================================================ */
var EMOJIS = ['🌙', '🌿', '✨', '🥀', '💚', '🍃', '😢', '💫', '🕯️', '💌', '🌸', '❤️', '🌲', '💧'];
var layer  = document.getElementById('emojiLayer');

function spawnEmoji() {
  if (!layer) return;
  var el = document.createElement('span');
  el.className = 'float-emoji';
  el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  el.style.left = (Math.random() * 95) + 'vw';
  var dur = 10 + Math.random() * 14;
  el.style.animationDuration = dur + 's';
  el.style.animationDelay   = (Math.random() * 4) + 's';
  el.style.fontSize = (1 + Math.random() * 1.4) + 'rem';
  layer.appendChild(el);
  setTimeout(function() { el.remove(); }, (dur + 4) * 1000);
}

if (layer) {
  for (var i = 0; i < 12; i++) {
    (function(n) { setTimeout(spawnEmoji, n * 600); })(i);
  }
  setInterval(spawnEmoji, 1800);
}

/* ============================================================
   CURSOR GLOW
============================================================ */
var glow = document.getElementById('cursorGlow');
if (glow) {
  document.addEventListener('mousemove', function(e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ============================================================
   CLICK PARTICLES BURST
============================================================ */
var BURST_EM = ['💚', '✨', '🌿', '🌙', '🥀', '💫', '🍃', '🌸'];

function burstAt(cx, cy) {
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      var p = document.createElement('div');
      p.className = 'particle';
      p.textContent = BURST_EM[Math.floor(Math.random() * BURST_EM.length)];
      p.style.left = cx + 'px';
      p.style.top  = cy + 'px';
      p.style.fontSize = (0.8 + Math.random() * 0.7) + 'rem';
      var angle = (Math.PI * 2 / 8) * idx;
      var dist  = 60 + Math.random() * 60;
      p.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
      p.style.setProperty('--dy', (Math.sin(angle) * dist) + 'px');
      p.style.animationDuration = (0.8 + Math.random() * 0.4) + 's';
      document.body.appendChild(p);
      setTimeout(function() { p.remove(); }, 1400);
    })(i);
  }
}

document.addEventListener('click', function(e) {
  burstAt(e.clientX, e.clientY);
});

/* ============================================================
   STICKER HOVER EFFECTS
============================================================ */
document.querySelectorAll('.sticker').forEach(function(s) {
  s.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.5) rotate(20deg)';
    this.style.filter    = 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.9))';
  });
  s.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.filter    = '';
  });
});

/* ============================================================
   SCROLL REVEAL (INTERSECTION OBSERVER)
============================================================ */
function initReveal() {
  document.querySelectorAll('.reveal:not(.in)').forEach(function(el) {
    observer.observe(el);
  });
}

var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

initReveal();

/* ============================================================
   3D TILT ON SHAYRI CARDS (MOUSE FOLLOW)
============================================================ */
document.addEventListener('mousemove', function(e) {
  document.querySelectorAll('.s-card').forEach(function(card) {
    var rect = card.getBoundingClientRect();
    var cx = rect.left + rect.width  / 2;
    var cy = rect.top  + rect.height / 2;
    var dx = (e.clientX - cx) / (rect.width  / 2);
    var dy = (e.clientY - cy) / (rect.height / 2);
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1.6) {
      var rx =  dy * 7;
      var ry = -dx * 7;
      card.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    } else {
      card.style.transform = '';
    }
  });
});

/* ============================================================
   RIPPLE EFFECT ON BUTTONS
============================================================ */
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.nav-submit-btn, .submit-btn, .filter-btn, .lang-btn, .mood-chip, .nav-btn');
  if (!btn) return;
  var rect = btn.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  var r = document.createElement('span');
  r.className = 'ripple-el';
  r.style.width  = size + 'px';
  r.style.height = size + 'px';
  r.style.left = (e.clientX - rect.left - size / 2) + 'px';
  r.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(r);
  setTimeout(function() { r.remove(); }, 600);
});

/* ============================================================
   LIKE BUTTON HEARTBEAT RE-TRIGGER
============================================================ */
document.addEventListener('click', function(e) {
  var lb = e.target.closest('.s-card-like');
  if (!lb) return;
  lb.classList.remove('liked');
  void lb.offsetWidth;
  lb.classList.add('liked');
});

/* ============================================================
   PAGE TITLE WAVE ENTRANCE ANIMATION
============================================================ */
function animPageTitle() {
  var title = document.querySelector('.page.active .page-title');
  if (!title) return;
  title.style.opacity   = '0';
  title.style.transform = 'translateY(20px)';
  setTimeout(function() {
    title.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    title.style.opacity    = '1';
    title.style.transform  = 'translateY(0)';
  }, 80);
}

var _origNavigate = navigate;
navigate = function(page) {
  _origNavigate(page);
  setTimeout(animPageTitle, 60);
};

/* ============================================================
   START REALTIME FIRESTORE LISTENER
============================================================ */
initFirestoreListener();
