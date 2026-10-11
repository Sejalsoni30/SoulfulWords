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
   Reads environment configuration from window.firebaseConfig (config.js)
   with fallback defaults for zero-config production deployments
============================================================ */
var DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAOTRAuoCWlTMSxXUr1Ze7gNsu3ItwuC3c",
  authDomain: "soulmatewords-1b474.firebaseapp.com",
  projectId: "soulmatewords-1b474",
  storageBucket: "soulmatewords-1b474.firebasestorage.app",
  messagingSenderId: "469339484488",
  appId: "1:469339484488:web:1071d1ad881928701e837d"
};

var firebaseConfig = window.firebaseConfig || DEFAULT_FIREBASE_CONFIG;

var db = null;
var firestoreShayris = [];
var isFirestoreOnline = false;

try {
  if (firebaseConfig && typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("🔥 Firebase initialized for project:", firebaseConfig.projectId);
  } else if (!firebaseConfig) {
    console.warn("⚠️ No Firebase config detected. Please ensure config.js is loaded with your Firebase credentials.");
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
   HERO INTERACTIVE EXPERIENCE & BILINGUAL VERSES
============================================================ */
var FEATURED_VERSES = [
  {
    en: [
      "Who says that once the <span class=\"hl\">night is over</span>,",
      "the matter is <span class=\"hl\">forgotten</span>?",
      "I still remember <span class=\"hl\">his name</span>",
      "to <span class=\"hl\">this day</span> 💔"
    ],
    hi: [
      "कौन कहता है कि <span class=\"hl\">रात बीती</span> और बात गई,",
      "अंधेरे ढल भी जाएं तो <span class=\"hl\">यादें नहीं मिटतीं</span>।",
      "मुझे तो आज भी <span class=\"hl\">उसका नाम</span>",
      "उसी तरह याद है 💔"
    ],
    category: "Midnight Melancholy",
    emoji: "🌙",
    author: "Memories — A Heart's Story",
    likes: 342,
    id: "hero-v1"
  },
  {
    en: [
      "The night keeps its secrets well,",
      "but the heart reveals them all —",
      "in the silence of a <span class=\"hl\">sleepless dawn</span> ✨"
    ],
    hi: [
      "रात अपने सारे राज़ छुपा लेती है,",
      "मगर दिल हर बात बयां कर देता है —",
      "एक <span class=\"hl\">जागती हुई सुबह</span> के सन्नाटे में ✨"
    ],
    category: "Quiet Longing",
    emoji: "✨",
    author: "A Sleepless Soul",
    likes: 219,
    id: "hero-v2"
  },
  {
    en: [
      "Even wilted roses hold the fragrance of",
      "a love that once <span class=\"hl\">set the sky on fire</span> 🌹",
      "memories never truly wither away."
    ],
    hi: [
      "मुरझाए हुए गुलाब भी उस खुशबू को समेटे रखते हैं,",
      "जिस मोहब्बत ने कभी <span class=\"hl\">आसमान को रोशन</span> किया था 🌹",
      "यादें कभी सचमुच नहीं मरतीं।"
    ],
    category: "Eternal Love",
    emoji: "🌹",
    author: "Meera",
    likes: 412,
    id: "hero-v3"
  },
  {
    en: [
      "I wrote your name on water, hoping",
      "the waves would carry my <span class=\"hl\">longing to your shore</span> 💌",
      "the sea remembers what I couldn't say."
    ],
    hi: [
      "मैंने पानी पर तेरा नाम लिखा था,",
      "कि लहरें मेरे दिल की <span class=\"hl\">तड़प तेरे किनारे</span> तक पहुंचा दें 💌",
      "समंदर सब जानता है जो मैं कह न सका।"
    ],
    category: "Unspoken Words",
    emoji: "💌",
    author: "Zara",
    likes: 188,
    id: "hero-v4"
  },
  {
    en: [
      "A candle does not mourn the darkness it destroys —",
      "it simply <span class=\"hl\">burns, and loves</span> until the dawn 🕯️",
      "giving light to the one who watches."
    ],
    hi: [
      "दीया कभी उस अंधेरे का मातम नहीं मनाता जिसे वो मिटाता है,",
      "वो तो बस सुबह तक <span class=\"hl\">जलता है, और प्यार करता है</span> 🕯️",
      "हर देखने वाले को रोशनी देकर।"
    ],
    category: "Sacred Hope",
    emoji: "🕯️",
    author: "Aryan",
    likes: 275,
    id: "hero-v5"
  },
  {
    en: [
      "Distance is just a test to see how far",
      "<span class=\"hl\">love can travel</span> across every ocean 🌊",
      "and mine has found its home in you."
    ],
    hi: [
      "फासले तो सिर्फ एक इम्तिहान हैं,",
      "कि <span class=\"hl\">मोहब्बत कितनी दूर</span> तक जा सकती है 🌊",
      "और मेरी मोहब्बत तुझमें आकर ठहर गई।"
    ],
    category: "Boundless Love",
    emoji: "🌊",
    author: "Ananya",
    likes: 389,
    id: "hero-v6"
  }
];

var currentFeaturedIdx = 0;
var currentHeroLang = 'english';
var heroLikesState = JSON.parse(localStorage.getItem('shayri_hero_likes') || '{}');

function renderFeaturedVerse(idx, lang) {
  var v = FEATURED_VERSES[idx];
  if (!v) return;

  var wrap = document.getElementById('verseDisplayWrap');
  var catEl = document.getElementById('heroVerseCategoryText');
  var emojiEl = document.getElementById('heroVerseEmoji');
  var authorEl = document.getElementById('heroAuthorName');
  var likeCountEl = document.getElementById('heroCardLikeCount');
  var likeBtn = document.getElementById('heroCardLikeBtn');
  var textField = document.getElementById('featuredVerseText');

  if (wrap) wrap.classList.add('fading');

  setTimeout(function() {
    if (catEl) catEl.textContent = v.category;
    if (emojiEl) emojiEl.textContent = v.emoji;
    if (authorEl) authorEl.textContent = v.author;

    var isLiked = !!heroLikesState[v.id];
    var count = v.likes + (isLiked ? 1 : 0);
    if (likeCountEl) likeCountEl.textContent = count;
    if (likeBtn) likeBtn.classList.toggle('liked', isLiked);

    var lines = (lang === 'hindi') ? v.hi : v.en;
    var html = '';

    if (lines.length >= 4) {
      html += '<p class="shayri-text' + (lang === 'hindi' ? ' hindi-text' : '') + '">';
      html += '<span class="shayri-line">' + lines[0] + '</span>';
      html += '<span class="shayri-line">' + lines[1] + '</span>';
      html += '</p><div class="divider"><span>✦</span></div><p class="shayri-text' + (lang === 'hindi' ? ' hindi-text' : '') + '">';
      html += '<span class="shayri-line shayri-line2">' + lines[2] + '</span>';
      html += '<span class="shayri-line shayri-line2">' + lines[3] + '</span>';
      html += '</p>';
    } else {
      html += '<p class="shayri-text' + (lang === 'hindi' ? ' hindi-text' : '') + '">';
      lines.forEach(function(l, i) {
        html += '<span class="shayri-line" style="animation-delay:' + (0.1 + i * 0.2) + 's;">' + l + '</span>';
      });
      html += '</p>';
    }

    if (textField) textField.innerHTML = html;
    if (wrap) wrap.classList.remove('fading');
  }, 200);
}

function nextFeaturedVerse() {
  currentFeaturedIdx = (currentFeaturedIdx + 1) % FEATURED_VERSES.length;
  renderFeaturedVerse(currentFeaturedIdx, currentHeroLang);
  burstAt(window.innerWidth / 2, window.innerHeight * 0.55);
}

function setHeroLanguage(lang) {
  currentHeroLang = lang;
  var enBtn = document.getElementById('hl-en');
  var hiBtn = document.getElementById('hl-hi');
  if (enBtn) enBtn.classList.toggle('active', lang === 'english');
  if (hiBtn) hiBtn.classList.toggle('active', lang === 'hindi');
  renderFeaturedVerse(currentFeaturedIdx, lang);
}

function copyFeaturedVerse() {
  var v = FEATURED_VERSES[currentFeaturedIdx];
  if (!v) return;
  var lines = (currentHeroLang === 'hindi') ? v.hi : v.en;
  var cleanText = lines.map(function(l) { return l.replace(/<[^>]*>?/gm, ''); }).join('\n');
  var fullText = '"' + cleanText + '"\n— ' + v.author + ' (via SoulfulWords)';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(function() {
      var copyIcon = document.getElementById('copyIconEl');
      if (copyIcon) {
        copyIcon.textContent = '✅';
        setTimeout(function() { copyIcon.textContent = '📋'; }, 2000);
      }
      showToast('📋 Verse copied to clipboard!');
    });
  } else {
    showToast('✨ ' + v.category);
  }
}

function toggleHeroLike() {
  var v = FEATURED_VERSES[currentFeaturedIdx];
  if (!v) return;

  var likeBtn = document.getElementById('heroCardLikeBtn');
  var countEl = document.getElementById('heroCardLikeCount');
  var isLiked = !!heroLikesState[v.id];

  if (isLiked) {
    delete heroLikesState[v.id];
  } else {
    heroLikesState[v.id] = true;
  }
  localStorage.setItem('shayri_hero_likes', JSON.stringify(heroLikesState));

  var count = v.likes + (!isLiked ? 1 : 0);
  if (countEl) countEl.textContent = count;

  if (likeBtn) {
    likeBtn.classList.toggle('liked', !isLiked);
    likeBtn.classList.add('pop');
    setTimeout(function() { likeBtn.classList.remove('pop'); }, 400);
  }

  showToast(!isLiked ? '💚 Felt in your heart!' : '🤍 Removed like');
}

function stickerClick(emoji, event) {
  var x = event ? event.clientX : window.innerWidth / 2;
  var y = event ? event.clientY : window.innerHeight / 2;
  burstAt(x, y);
  showToast(emoji + ' Echoes of the heart');
}

function navigateFilter(mood) {
  navigate('explore');
  setTimeout(function() {
    renderGrid(mood);
  }, 100);
}

/* ============================================================
   SOULFUL MUSIC ENGINE (WEB AUDIO API SYNTHESIZER)
   5 Beautiful Ambient Tracks:
   0: 🎹 Melancholy Piano (Raag / Nocturne Arpeggios)
   1: 🪈 Soulful Bansuri Flute (Expressive Vibrato & Tanpura Drone)
   2: 🌧️ Midnight Rain & Wind Chimes (Rain Bed + Crystal Bells)
   3: 💫 Starlit Lo-Fi Dreams (Warm Rhodes 7ths & Vinyl Pulse)
   4: 🍃 Forest Mist & Singing Bowls (Tibetan Shimmer & Wind)
============================================================ */
var SOULFUL_TRACKS = [
  { id: 0, icon: '🎹', name: 'Melancholy Piano', desc: 'Deep nocturnal piano arpeggios', type: 'piano' },
  { id: 1, icon: '🪈', name: 'Soulful Bansuri Flute', desc: 'Meditative longing & warm strings', type: 'bansuri' },
  { id: 2, icon: '🌧️', name: 'Midnight Rain & Chimes', desc: 'Gentle night rainfall & crystal wind bells', type: 'rain_chimes' },
  { id: 3, icon: '💫', name: 'Starlit Lo-Fi Dreams', desc: 'Warm 7th chords & nostalgic vinyl pulse', type: 'lofi' },
  { id: 4, icon: '🍃', name: 'Forest Mist & Singing Bowls', desc: 'Peaceful harmonic drone & tranquil bells', type: 'bowls' }
];

var musicAudioCtx = null;
var musicMasterGain = null;
var musicDelayNode = null;
var musicDelayGain = null;
var isMusicPlaying = false;
var currentMusicTrackIdx = 0;
var musicTimers = [];
var musicActiveNodes = [];

function initMusicAudioContext() {
  if (!musicAudioCtx) {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    musicAudioCtx = new AudioContextClass();

    musicMasterGain = musicAudioCtx.createGain();
    musicMasterGain.gain.setValueAtTime(0.001, musicAudioCtx.currentTime);

    // Warm studio delay bus for acoustic depth
    musicDelayNode = musicAudioCtx.createDelay();
    musicDelayNode.delayTime.setValueAtTime(0.38, musicAudioCtx.currentTime);

    musicDelayGain = musicAudioCtx.createGain();
    musicDelayGain.gain.setValueAtTime(0.32, musicAudioCtx.currentTime);

    var delayFilter = musicAudioCtx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1400, musicAudioCtx.currentTime);

    musicDelayNode.connect(delayFilter);
    delayFilter.connect(musicDelayGain);
    musicDelayGain.connect(musicDelayNode);
    musicDelayGain.connect(musicMasterGain);

    musicMasterGain.connect(musicAudioCtx.destination);
  }

  if (musicAudioCtx.state === 'suspended') {
    musicAudioCtx.resume();
  }
}

function stopCurrentTrackMusic(fadeOutSec) {
  var fade = fadeOutSec || 0.4;
  musicTimers.forEach(function(t) { clearTimeout(t); clearInterval(t); });
  musicTimers = [];

  if (musicMasterGain && musicAudioCtx) {
    try {
      musicMasterGain.gain.cancelScheduledValues(musicAudioCtx.currentTime);
      musicMasterGain.gain.linearRampToValueAtTime(0.001, musicAudioCtx.currentTime + fade);
    } catch(e) {}
  }

  setTimeout(function() {
    musicActiveNodes.forEach(function(node) {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch(e) {}
    });
    musicActiveNodes = [];
  }, (fade + 0.05) * 1000);
}

/* --- TRACK 0: MELANCHOLY PIANO SYNTHESIS --- */
function startMelancholyPianoTrack() {
  var chords = [
    [110.00, 164.81, 261.63, 329.63, 392.00, 493.88], // Am9
    [87.31, 130.81, 220.00, 329.63, 392.00, 523.25],  // Fmaj7
    [73.42, 110.00, 174.61, 261.63, 329.63, 440.00],  // Dm9
    [82.41, 123.47, 196.00, 293.66, 392.00, 493.88]   // Em7
  ];

  var chordIdx = 0;
  var noteIdx = 0;

  function playPianoNote(freq, vel) {
    if (!musicAudioCtx || !isMusicPlaying) return;
    try {
      var now = musicAudioCtx.currentTime;
      var osc1 = musicAudioCtx.createOscillator();
      var osc2 = musicAudioCtx.createOscillator();
      var noteGain = musicAudioCtx.createGain();
      var filter = musicAudioCtx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.0015, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 2.2);

      var volume = (vel || 0.18) * 0.28;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(volume, now + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(musicMasterGain);
      noteGain.connect(musicDelayNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.0);
      osc2.stop(now + 3.0);

      musicActiveNodes.push(osc1, osc2, noteGain, filter);
    } catch(e) {}
  }

  function pianoTick() {
    if (!isMusicPlaying) return;
    var currentChord = chords[chordIdx];
    var freq = currentChord[noteIdx % currentChord.length];

    var vel = (noteIdx === 0) ? 0.35 : 0.22;
    playPianoNote(freq, vel);

    noteIdx++;
    if (noteIdx >= currentChord.length) {
      noteIdx = 0;
      chordIdx = (chordIdx + 1) % chords.length;
    }

    var delay = 480 + Math.floor(Math.random() * 220);
    var t = setTimeout(pianoTick, delay);
    musicTimers.push(t);
  }

  pianoTick();
}

/* --- TRACK 1: SOULFUL BANSURI FLUTE & DRONE --- */
function startBansuriFluteTrack() {
  var droneNotes = [65.41, 98.00, 130.81]; // C2, G2, C3
  droneNotes.forEach(function(freq) {
    try {
      var now = musicAudioCtx.currentTime;
      var osc = musicAudioCtx.createOscillator();
      var droneGain = musicAudioCtx.createGain();
      var filter = musicAudioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, now);

      droneGain.gain.setValueAtTime(0.001, now);
      droneGain.gain.linearRampToValueAtTime(0.09, now + 2.0);

      osc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(musicMasterGain);

      osc.start(now);
      musicActiveNodes.push(osc, droneGain, filter);
    } catch(e) {}
  });

  // Raag Shivaranjani & Bhairavi emotive phrases (C, D, Eb, G, A, C')
  var fluteMotifs = [
    [261.63, 293.66, 311.13, 392.00],          // Ascending longing
    [392.00, 440.00, 523.25, 392.00],          // High emotive crest
    [523.25, 440.00, 392.00, 311.13, 293.66],  // Gentle descending meend
    [293.66, 311.13, 293.66, 261.63],          // Restful cadence on root Sa
    [392.00, 311.13, 392.00, 523.25]           // Yearning swell
  ];

  var motifIdx = 0;
  var stepIdx = 0;

  function playFlutePhrase() {
    if (!isMusicPlaying) return;
    try {
      var currentMotif = fluteMotifs[motifIdx % fluteMotifs.length];
      var note = currentMotif[stepIdx % currentMotif.length];
      var isLastInMotif = (stepIdx === currentMotif.length - 1);
      var duration = isLastInMotif ? (2.4 + Math.random() * 0.8) : (1.4 + Math.random() * 0.6);
      var now = musicAudioCtx.currentTime;

      var osc = musicAudioCtx.createOscillator();
      var subOsc = musicAudioCtx.createOscillator();
      var noteGain = musicAudioCtx.createGain();
      var filter = musicAudioCtx.createBiquadFilter();

      // Expressive vibrato LFO (starts subtle and blooms)
      var lfo = musicAudioCtx.createOscillator();
      var lfoGain = musicAudioCtx.createGain();
      lfo.frequency.setValueAtTime(4.8, now);
      lfoGain.gain.setValueAtTime(1.0, now);
      lfoGain.gain.linearRampToValueAtTime(4.8, now + 0.6); // Vibrato blooms into note
      lfo.connect(osc.frequency);
      lfo.connect(subOsc.frequency);

      osc.type = 'sine';
      // Subtle portamento glide into note
      osc.frequency.setValueAtTime(note * 0.985, now);
      osc.frequency.exponentialRampToValueAtTime(note, now + 0.12);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(note * 2 * 0.985, now);
      subOsc.frequency.exponentialRampToValueAtTime(note * 2, now + 0.12);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(note * 1.3, now);
      filter.Q.setValueAtTime(2.0, now);

      var peakVol = isLastInMotif ? 0.28 : 0.22;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(peakVol, now + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(musicMasterGain);
      noteGain.connect(musicDelayNode);

      lfo.start(now);
      osc.start(now);
      subOsc.start(now);
      lfo.stop(now + duration + 0.1);
      osc.stop(now + duration + 0.1);
      subOsc.stop(now + duration + 0.1);

      musicActiveNodes.push(osc, subOsc, lfo, noteGain, filter);

      stepIdx++;
      if (stepIdx >= currentMotif.length) {
        stepIdx = 0;
        motifIdx = (motifIdx + 1) % fluteMotifs.length;
      }
    } catch(e) {}

    var pause = (duration * 1000) + (isLastInMotif ? (1200 + Math.random() * 800) : 180);
    var t = setTimeout(playFlutePhrase, pause);
    musicTimers.push(t);
  }

  playFlutePhrase();
}

/* --- TRACK 2: MIDNIGHT RAIN & WIND CHIMES --- */
function startRainAndChimesTrack() {
  // Gentle continuous rain bed
  try {
    var bufferSize = 2 * musicAudioCtx.sampleRate;
    var noiseBuffer = musicAudioCtx.createBuffer(1, bufferSize, musicAudioCtx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.024;
      b6 = white * 0.115926;
    }

    var rainSrc = musicAudioCtx.createBufferSource();
    rainSrc.buffer = noiseBuffer;
    rainSrc.loop = true;

    var filter = musicAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, musicAudioCtx.currentTime);

    var rainGain = musicAudioCtx.createGain();
    rainGain.gain.setValueAtTime(0.001, musicAudioCtx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.22, musicAudioCtx.currentTime + 1.2);

    rainSrc.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(musicMasterGain);

    rainSrc.start(0);
    musicActiveNodes.push(rainSrc, rainGain, filter);
  } catch(e) {}

  // Pentatonic Crystal Wind Bells
  var chimeNotes = [659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51, 1567.98];

  function strikeChime() {
    if (!isMusicPlaying) return;
    try {
      var freq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
      var now = musicAudioCtx.currentTime;

      var osc1 = musicAudioCtx.createOscillator();
      var osc2 = musicAudioCtx.createOscillator();
      var chimeGain = musicAudioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, now); // Metallic overtone

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc1.connect(chimeGain);
      osc2.connect(chimeGain);
      chimeGain.connect(musicMasterGain);
      chimeGain.connect(musicDelayNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.4);
      osc2.stop(now + 3.4);

      musicActiveNodes.push(osc1, osc2, chimeGain);
    } catch(e) {}

    var pause = 1200 + Math.random() * 2200;
    var t = setTimeout(strikeChime, pause);
    musicTimers.push(t);
  }

  strikeChime();
}

/* --- TRACK 3: STARLIT LO-FI DREAMS --- */
function startLoFiDreamsTrack() {
  var lofiChords = [
    [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
    [110.00, 196.00, 261.63, 329.63],         // Am7
    [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
    [98.00, 174.61, 246.94, 329.63, 392.00]   // G13
  ];

  var chordIdx = 0;

  function playLoFiPad() {
    if (!isMusicPlaying) return;
    try {
      var chord = lofiChords[chordIdx];
      chordIdx = (chordIdx + 1) % lofiChords.length;
      var now = musicAudioCtx.currentTime;
      var duration = 4.2;

      chord.forEach(function(freq) {
        var osc = musicAudioCtx.createOscillator();
        var padGain = musicAudioCtx.createGain();
        var filter = musicAudioCtx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(680, now);

        padGain.gain.setValueAtTime(0.001, now);
        padGain.gain.linearRampToValueAtTime(0.045, now + 0.8);
        padGain.gain.setValueAtTime(0.04, now + duration - 0.9);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(padGain);
        padGain.connect(musicMasterGain);
        padGain.connect(musicDelayNode);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        musicActiveNodes.push(osc, padGain, filter);
      });
    } catch(e) {}

    var t = setTimeout(playLoFiPad, 3900);
    musicTimers.push(t);
  }

  playLoFiPad();
}

/* --- TRACK 4: FOREST MIST & TIBETAN SINGING BOWLS --- */
function startSingingBowlsTrack() {
  // Misty harmonic drone
  try {
    var now = musicAudioCtx.currentTime;
    var droneOsc = musicAudioCtx.createOscillator();
    var droneGain = musicAudioCtx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(108, now); // Sacred root
    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.linearRampToValueAtTime(0.08, now + 2.0);
    droneOsc.connect(droneGain);
    droneGain.connect(musicMasterGain);
    droneOsc.start(now);
    musicActiveNodes.push(droneOsc, droneGain);
  } catch(e) {}

  var bowlFrequencies = [216.0, 288.0, 324.0, 432.0];

  function strikeSingingBowl() {
    if (!isMusicPlaying) return;
    try {
      var baseFreq = bowlFrequencies[Math.floor(Math.random() * bowlFrequencies.length)];
      var now = musicAudioCtx.currentTime;

      // Dual frequencies creating relaxing acoustic beat frequency
      var osc1 = musicAudioCtx.createOscillator();
      var osc2 = musicAudioCtx.createOscillator();
      var overtoneOsc = musicAudioCtx.createOscillator();
      var bowlGain = musicAudioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq + 1.8, now); // 1.8Hz soothing acoustic shimmer

      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(baseFreq * 2.81, now);

      bowlGain.gain.setValueAtTime(0.001, now);
      bowlGain.gain.linearRampToValueAtTime(0.16, now + 0.8);
      bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);

      osc1.connect(bowlGain);
      osc2.connect(bowlGain);
      overtoneOsc.connect(bowlGain);
      bowlGain.connect(musicMasterGain);
      bowlGain.connect(musicDelayNode);

      osc1.start(now);
      osc2.start(now);
      overtoneOsc.start(now);
      osc1.stop(now + 6.8);
      osc2.stop(now + 6.8);
      overtoneOsc.stop(now + 6.8);

      musicActiveNodes.push(osc1, osc2, overtoneOsc, bowlGain);
    } catch(e) {}

    var pause = 4500 + Math.random() * 2500;
    var t = setTimeout(strikeSingingBowl, pause);
    musicTimers.push(t);
  }

  strikeSingingBowl();
}

/* --- PLAY ENGINE CONTROLLER --- */
function startMusicPlayback(trackIndex) {
  initMusicAudioContext();
  stopCurrentTrackMusic(0.25);

  currentMusicTrackIdx = trackIndex;
  var track = SOULFUL_TRACKS[currentMusicTrackIdx] || SOULFUL_TRACKS[0];

  setTimeout(function() {
    if (!isMusicPlaying) return;
    try {
      musicMasterGain.gain.cancelScheduledValues(musicAudioCtx.currentTime);
      musicMasterGain.gain.setValueAtTime(0.001, musicAudioCtx.currentTime);
      musicMasterGain.gain.linearRampToValueAtTime(0.35, musicAudioCtx.currentTime + 1.0);
    } catch(e) {}

    switch (track.type) {
      case 'piano':
        startMelancholyPianoTrack();
        break;
      case 'bansuri':
        startBansuriFluteTrack();
        break;
      case 'rain_chimes':
        startRainAndChimesTrack();
        break;
      case 'lofi':
        startLoFiDreamsTrack();
        break;
      case 'bowls':
        startSingingBowlsTrack();
        break;
      default:
        startMelancholyPianoTrack();
    }
  }, 260);

  updateMusicPlayerUI();
}

function updateMusicPlayerUI() {
  var pill = document.getElementById('musicPlayerPill');
  var playIcon = document.getElementById('musicPlayIcon');
  var titleText = document.getElementById('musicTitleText');
  var currentTrack = SOULFUL_TRACKS[currentMusicTrackIdx];

  if (titleText && currentTrack) {
    titleText.textContent = currentTrack.icon + ' ' + currentTrack.name;
  }

  if (pill) {
    if (isMusicPlaying) {
      pill.classList.add('playing');
    } else {
      pill.classList.remove('playing');
    }
  }

  if (playIcon) {
    playIcon.innerHTML = isMusicPlaying
      ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }

  // Update active state in track list
  SOULFUL_TRACKS.forEach(function(t, idx) {
    var item = document.getElementById('mtrack-' + idx);
    if (item) {
      if (idx === currentMusicTrackIdx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  });
}

function toggleMusicPlayback() {
  if (isMusicPlaying) {
    isMusicPlaying = false;
    stopCurrentTrackMusic(0.5);
    updateMusicPlayerUI();
    showToast('🔇 Music paused');
  } else {
    isMusicPlaying = true;
    startMusicPlayback(currentMusicTrackIdx);
    var track = SOULFUL_TRACKS[currentMusicTrackIdx];
    showToast('🎵 Playing: ' + track.name);
  }
}

function nextMusicTrack() {
  currentMusicTrackIdx = (currentMusicTrackIdx + 1) % SOULFUL_TRACKS.length;
  isMusicPlaying = true;
  startMusicPlayback(currentMusicTrackIdx);
  var track = SOULFUL_TRACKS[currentMusicTrackIdx];
  showToast('⏭️ Switched to: ' + track.name);
}

function selectMusicTrack(index) {
  if (index >= 0 && index < SOULFUL_TRACKS.length) {
    currentMusicTrackIdx = index;
    isMusicPlaying = true;
    startMusicPlayback(currentMusicTrackIdx);
    var drop = document.getElementById('musicDropdown');
    if (drop) drop.classList.remove('open');
    var track = SOULFUL_TRACKS[currentMusicTrackIdx];
    showToast('✨ Now Playing: ' + track.name);
  }
}

function toggleTrackMenu() {
  var drop = document.getElementById('musicDropdown');
  if (drop) {
    drop.classList.toggle('open');
  }
}

// Close track menu when clicking anywhere outside
document.addEventListener('click', function(e) {
  var pill = document.getElementById('musicPlayerPill');
  var drop = document.getElementById('musicDropdown');
  if (drop && drop.classList.contains('open')) {
    if (!pill || !pill.contains(e.target)) {
      drop.classList.remove('open');
    }
  }
});

/* ============================================================
   START REALTIME FIRESTORE LISTENER
============================================================ */
initFirestoreListener();
