import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { Camera, Home, ShoppingCart, Utensils, History, Plus, X, Check, ArrowRight, Loader2, Info, User } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'calorie-tracker-app';

// --- Hardcoded Data ---
const BOZOR_ITEMS = [
  // Go'sht va oqsillar
  { id: 'b1', name: 'Mol go\'shti (100g)', calories: 250 },
  { id: 'b2', name: 'Qo\'y go\'shti (100g)', calories: 290 },
  { id: 'b3', name: 'Tovuq go\'shti (100g)', calories: 165 },
  { id: 'b4', name: 'Ot go\'shti (100g)', calories: 175 },
  { id: 'b5', name: 'Qazi (100g)', calories: 350 },
  { id: 'b6', name: 'Baliq (100g)', calories: 120 },
  { id: 'b7', name: 'Tuxum (1 dona)', calories: 70 },
  
  // Sabzavotlar
  { id: 'b8', name: 'Kartoshka (100g)', calories: 77 },
  { id: 'b9', name: 'Piyoz (100g)', calories: 40 },
  { id: 'b10', name: 'Sabzi (100g)', calories: 41 },
  { id: 'b11', name: 'Pomidor (100g)', calories: 18 },
  { id: 'b12', name: 'Bodring (100g)', calories: 15 },
  { id: 'b13', name: 'Karam (100g)', calories: 25 },
  { id: 'b14', name: 'Bulg\'or qalampiri (100g)', calories: 20 },
  { id: 'b15', name: 'Baqlajon (100g)', calories: 25 },
  { id: 'b16', name: 'Qovoq (100g)', calories: 26 },
  { id: 'b17', name: 'Sholg\'om (100g)', calories: 28 },
  { id: 'b18', name: 'Turp (100g)', calories: 35 },
  { id: 'b19', name: 'Sarimsoqpiyoz (1 dona)', calories: 4 },
  { id: 'b20', name: 'Ko\'katlar / Ukrop, kashnich (100g)', calories: 23 },
  
  // Mevalar va poliz
  { id: 'b21', name: 'Olma (100g)', calories: 52 },
  { id: 'b22', name: 'Uzum (100g)', calories: 69 },
  { id: 'b23', name: 'Tarvuz (100g)', calories: 30 },
  { id: 'b24', name: 'Qovun (100g)', calories: 34 },
  { id: 'b25', name: 'Nok (100g)', calories: 57 },
  { id: 'b26', name: 'Shaftoli (100g)', calories: 39 },
  { id: 'b27', name: 'O\'rik (100g)', calories: 48 },
  { id: 'b28', name: 'Gilos (100g)', calories: 50 },
  { id: 'b29', name: 'Anjir (100g)', calories: 74 },
  { id: 'b30', name: 'Anor (100g)', calories: 83 },
  { id: 'b31', name: 'Qulupnay (100g)', calories: 32 },
  
  // Don, dukkaklilar va non
  { id: 'b32', name: 'Guruch (Lazer/Devzira, 100g)', calories: 130 },
  { id: 'b33', name: 'Loviya (100g, xom)', calories: 333 },
  { id: 'b34', name: 'Mosh (100g, xom)', calories: 347 },
  { id: 'b35', name: 'No\'xat (100g, xom)', calories: 364 },
  { id: 'b36', name: 'Makaron (100g, qaynatilgan)', calories: 131 },
  { id: 'b37', name: 'Tandir non (100g)', calories: 275 },
  { id: 'b38', name: 'Patir non (100g)', calories: 310 },
  { id: 'b39', name: 'Buxoro noni (100g)', calories: 280 },
  { id: 'b40', name: 'Yopgan non (100g)', calories: 260 },
  
  // Sut mahsulotlari va yog'lar
  { id: 'b41', name: 'Sut (1 stakan, 250ml)', calories: 150 },
  { id: 'b42', name: 'Qatiq (1 stakan, 250ml)', calories: 110 },
  { id: 'b43', name: 'Suzma (100g)', calories: 95 },
  { id: 'b44', name: 'Qaymoq (100g)', calories: 340 },
  { id: 'b45', name: 'Sariyog\' (1 osh qoshiq)', calories: 72 },
  { id: 'b46', name: 'Paxta yog\'i (1 osh qoshiq)', calories: 120 },
  { id: 'b47', name: 'Pista yog\'i (1 osh qoshiq)', calories: 120 },
  { id: 'b48', name: 'Qurt (1 dona katta)', calories: 25 },
  { id: 'b49', name: 'Tvorog (100g)', calories: 155 },
  
  // Chaq-chuq va shirinliklar
  { id: 'b50', name: 'Yong\'oq (100g)', calories: 654 },
  { id: 'b51', name: 'Mayiz (100g)', calories: 299 },
  { id: 'b52', name: 'Bodom (100g)', calories: 579 },
  { id: 'b53', name: 'Xandon pista (100g)', calories: 562 },
  { id: 'b54', name: 'Turshak / O\'rik qoqi (100g)', calories: 241 },
  { id: 'b55', name: 'Novvat (100g)', calories: 380 },
  { id: 'b56', name: 'Asal (1 osh qoshiq)', calories: 64 },
  { id: 'b57', name: 'Parvarda (100g)', calories: 390 },
];

const MILLIY_TAOMLAR = [
  // Palov turlari
  { id: 'm1', name: 'Osh / Palov (1 porsiya)', calories: 750 },
  { id: 'm2', name: 'Choyxona palov (1 porsiya)', calories: 850 },
  { id: 'm3', name: 'To\'y oshi (1 porsiya)', calories: 800 },
  { id: 'm4', name: 'Qovurma chug\'urma (1 porsiya)', calories: 600 },
  
  // Hamirli va tandir taomlar
  { id: 'm5', name: 'Go\'shtli somsa (1 dona katta)', calories: 350 },
  { id: 'm6', name: 'Qovoqli somsa (1 dona)', calories: 220 },
  { id: 'm7', name: 'Kartoshkali somsa (1 dona)', calories: 250 },
  { id: 'm8', name: 'Ko\'k somsa (1 dona)', calories: 180 },
  { id: 'm9', name: 'Manti (1 dona, go\'shtli)', calories: 90 },
  { id: 'm10', name: 'Manti (1 dona, qovoqli)', calories: 60 },
  { id: 'm11', name: 'Xonim (1 dona)', calories: 300 },
  { id: 'm12', name: 'Qatlama (1 dona)', calories: 350 },
  { id: 'm13', name: 'Belyash / Perashka (1 dona)', calories: 280 },
  { id: 'm14', name: 'Cheburek (1 dona)', calories: 300 },
  { id: 'm15', name: 'Gumma (1 dona)', calories: 210 },
  { id: 'm16', name: 'Tuxum barak (1 porsiya)', calories: 500 },
  
  // Suyuq ovqatlar (Sho'rvalar)
  { id: 'm17', name: 'Qaynatma sho\'rva (1 porsiya)', calories: 350 },
  { id: 'm18', name: 'Qovurma sho\'rva (1 porsiya)', calories: 450 },
  { id: 'm19', name: 'Mastava (1 porsiya)', calories: 380 },
  { id: 'm20', name: 'Mashxo\'rda (1 porsiya)', calories: 420 },
  { id: 'm21', name: 'Chuchvara (suyuq, 1 porsiya)', calories: 400 },
  { id: 'm22', name: 'Noxat sho\'rak (1 porsiya)', calories: 400 },
  
  // Qovurma va quyuq taomlar
  { id: 'm23', name: 'Qozonkabob (1 porsiya)', calories: 850 },
  { id: 'm24', name: 'Qovurma lag\'mon (1 porsiya)', calories: 650 },
  { id: 'm25', name: 'Suyuq lag\'mon (1 porsiya)', calories: 450 },
  { id: 'm26', name: 'Uyg\'ur lag\'mon (1 porsiya)', calories: 550 },
  { id: 'm27', name: 'Norin (1 porsiya)', calories: 600 },
  { id: 'm28', name: 'Dimlama (1 porsiya)', calories: 450 },
  { id: 'm29', name: 'Do\'lma (1 porsiya, 3 dona)', calories: 350 },
  { id: 'm30', name: 'Karam do\'lma (1 porsiya)', calories: 320 },
  { id: 'm31', name: 'Shivit oshi (1 porsiya)', calories: 450 },
  { id: 'm32', name: 'Tandir go\'sht (100g)', calories: 280 },
  { id: 'm33', name: 'Jiz (1 porsiya)', calories: 750 },
  { id: 'm34', name: 'Hasip (100g)', calories: 290 },
  { id: 'm35', name: 'Qovurma chuchvara (1 porsiya)', calories: 550 },
  
  // Shashliklar
  { id: 'm36', name: 'Jaz shashlik (Mol go\'shti, 1 six)', calories: 250 },
  { id: 'm37', name: 'Qiyma shashlik (1 six)', calories: 220 },
  { id: 'm38', name: 'Jigar shashlik (1 six)', calories: 180 },
  { id: 'm39', name: 'Tovuq shashlik (1 six)', calories: 190 },
  { id: 'm40', name: 'Qovurg\'a shashlik (1 six)', calories: 300 },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [todayLogs, setTodayLogs] = useState([]);
  
  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile(false);
      }
      setLoading(false);
    }, (err) => {
      console.error("Profile fetch error:", err);
      setLoading(false);
    });

    const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'daily_logs', todayStr);
    const unsubLogs = onSnapshot(logRef, (snap) => {
      if (snap.exists()) {
        setTodayLogs(snap.data().items || []);
      } else {
        setTodayLogs([]);
      }
    }, (err) => {
      console.error("Logs fetch error:", err);
    });

    return () => {
      unsubProfile();
      unsubLogs();
    };
  }, [user, todayStr]);

  const saveProfile = async (profileData) => {
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    await setDoc(profileRef, profileData);
  };

  const addFoodLog = async (foodItem) => {
    if (!user) return;
    const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'daily_logs', todayStr);
    const newItem = { ...foodItem, id: crypto.randomUUID(), timestamp: Date.now() };
    const updatedItems = [...todayLogs, newItem];
    await setDoc(logRef, { items: updatedItems }, { merge: true });
  };

  const removeFoodLog = async (idToRemove) => {
    if (!user) return;
    const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'daily_logs', todayStr);
    const updatedItems = todayLogs.filter(item => item.id !== idToRemove);
    await setDoc(logRef, { items: updatedItems }, { merge: true });
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;
  }

  if (profile === false || isEditingProfile) {
    return <Onboarding 
      initialData={profile} 
      onComplete={(data) => {
        saveProfile(data);
        setIsEditingProfile(false);
      }} 
      onCancel={profile !== false ? () => setIsEditingProfile(false) : undefined}
    />;
  }

  return (
    <div className="h-[100dvh] w-full bg-gray-100 flex justify-center overflow-hidden font-sans">
      <div className="w-full h-full sm:max-w-md bg-white flex flex-col relative shadow-none sm:shadow-2xl">
        
        {/* Header */}
        <header className="bg-emerald-600 text-white p-4 shadow-md z-10 pt-safe-top">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Kaloriya Treker</h1>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="text-sm font-medium bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer active:scale-95 touch-manipulation"
            >
              <User size={14} /> {profile?.name}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-28 p-4 w-full">
          {activeTab === 'dashboard' && <Dashboard profile={profile} logs={todayLogs} />}
          {activeTab === 'camera' && <AiCamera addFoodLog={addFoodLog} setActiveTab={setActiveTab} />}
          {activeTab === 'bozor' && <FoodList title="Bozor Narsalari" data={BOZOR_ITEMS} addFoodLog={addFoodLog} />}
          {activeTab === 'taomlar' && <FoodList title="Milliy Taomlar" data={MILLIY_TAOMLAR} addFoodLog={addFoodLog} />}
          {activeTab === 'history' && <HistoryTab logs={todayLogs} removeFoodLog={removeFoodLog} />}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-6 sm:pb-2 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-20">
          <NavButton active={activeTab === 'dashboard'} icon={<Home size={24} />} label="Asosiy" onClick={() => setActiveTab('dashboard')} />
          <NavButton active={activeTab === 'bozor'} icon={<ShoppingCart size={24} />} label="Bozor" onClick={() => setActiveTab('bozor')} />
          
          <div className="relative -top-8">
            <button 
              onClick={() => setActiveTab('camera')}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 active:scale-95 touch-manipulation ${activeTab === 'camera' ? 'bg-emerald-700 text-white' : 'bg-emerald-500 text-white'}`}
            >
              <Camera size={32} />
            </button>
          </div>

          <NavButton active={activeTab === 'taomlar'} icon={<Utensils size={24} />} label="Taomlar" onClick={() => setActiveTab('taomlar')} />
          <NavButton active={activeTab === 'history'} icon={<History size={24} />} label="Tarix" onClick={() => setActiveTab('history')} />
        </nav>
      </div>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-16 p-2 transition-colors touch-manipulation ${active ? 'text-emerald-600' : 'text-gray-400'}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function Onboarding({ onComplete, initialData, onCancel }) {
  const [name, setName] = useState(initialData?.name || 'Asadbek');
  const [weight, setWeight] = useState(initialData?.weight || 96);
  const [height, setHeight] = useState(initialData?.height || 172);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bmr = (10 * weight) + (6.25 * height) - (5 * 30) + 5;
    const tdee = bmr * 1.2;
    const goal = Math.round(tdee - 500);

    onComplete({
      name,
      weight: Number(weight),
      height: Number(height),
      dailyGoal: goal > 1200 ? goal : 1200
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 relative">
        {onCancel && (
          <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
            <X size={20} />
          </button>
        )}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Utensils size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {initialData ? "Ma'lumotlarni yangilash" : "Xush kelibsiz!"}
        </h2>
        <p className="text-center text-gray-500 mb-8">Kunlik kaloriya maqsadingizni hisoblash uchun ma'lumotlaringizni kiriting.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ismingiz</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-4 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vazningiz (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} required
                className="w-full px-4 py-4 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bo'yingiz (sm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} required
                className="w-full px-4 py-4 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl mt-6 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
            {initialData ? "Saqlash" : "Boshlash"} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ profile, logs }) {
  const totalConsumed = logs.reduce((sum, item) => sum + item.calories, 0);
  const goal = profile?.dailyGoal || 2000;
  const percentage = Math.min(Math.round((totalConsumed / goal) * 100), 100);
  
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isOverGoal = percentage >= 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center">
        <h2 className="text-gray-500 font-medium mb-6 uppercase tracking-wider text-sm">Bugungi natija</h2>
        
        <div className="relative flex items-center justify-center w-56 h-56">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
            <defs>
              <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="112" cy="112" r={radius} stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
            <circle cx="112" cy="112" r={radius} stroke={isOverGoal ? "url(#redGradient)" : "url(#emeraldGradient)"} strokeWidth="14" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-5xl font-extrabold ${isOverGoal ? 'text-red-500' : 'text-gray-800'}`}>
              {totalConsumed}
            </span>
            <span className="text-sm font-medium text-gray-400 mt-1">/ {goal} kkal</span>
          </div>
        </div>

        <div className={`mt-8 px-6 py-2 rounded-full text-sm font-bold ${isOverGoal ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {isOverGoal 
            ? 'Kunlik me\'yordan oshib ketdingiz!'
            : `Yana ${goal - totalConsumed} kkal yeyishingiz mumkin`}
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 flex gap-4 items-start border border-emerald-100">
        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-emerald-800 text-sm mb-1">Maslahat</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Ko'proq suv ichishni unutmang. Ovqatlanish ratsioningizda meva va sabzavotlar ko'proq bo'lishiga harakat qiling.
          </p>
        </div>
      </div>
    </div>
  );
}

function AiCamera({ addFoodLog, setActiveTab }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      await analyzeImageWithGemini(base64String);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImageWithGemini = async (base64Data) => {
    try {
      const payload = {
        contents: [{
          role: "user",
          parts: [
            { text: "Siz diyetolog va O'zbek milliy taomlari bo'yicha uzbek tilida gaplashadigan eksportsiz. Rasmdagi ovqatni tahlil qiling. Menga faqat quyidagi formatdagi JSON obyektni qaytaring, boshqa hech qanday izoh qo'shmang (markdown ham kerak emas): {\"mealName\": \"Ovqat nomi\", \"ingredients\": [{\"name\": \"Masalliq nomi\", \"calories\": tahmini_kaloriya_soni}]}" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const parsedJSON = JSON.parse(textResponse);
        
        const withChecked = {
          ...parsedJSON,
          ingredients: (parsedJSON.ingredients || []).map(ing => ({ ...ing, checked: true }))
        };
        
        setResult(withChecked);
      } else {
        throw new Error("Javob olinmadi");
      }
    } catch (err) {
      console.error(err);
      setError("Suratni tahlil qilishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleIngredient = (index) => {
    const newIngredients = [...result.ingredients];
    newIngredients[index].checked = !newIngredients[index].checked;
    setResult({ ...result, ingredients: newIngredients });
  };

  const calculateTotal = () => {
    if (!result) return 0;
    return result.ingredients.reduce((sum, ing) => ing.checked ? sum + ing.calories : sum, 0);
  };

  const handleSave = () => {
    const total = calculateTotal();
    const finalName = result.mealName;
    addFoodLog({ name: finalName, calories: total, type: 'ai-analysis' });
    setActiveTab('history');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in p-2">
      {!analyzing && !result && (
        <div className="text-center">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Sun'iy Intellekt Kamerasi</h2>
          <p className="text-gray-500 mb-8 max-w-[250px] mx-auto text-sm">
            Ovqatingizni rasmga oling va biz uning kaloriyasini hisoblab beramiz.
          </p>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-10 text-lg rounded-full shadow-lg shadow-emerald-200 transition-all active:scale-95 touch-manipulation w-full max-w-[300px]"
          >
            Rasmga olish
          </button>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef}
            onChange={handleCapture}
            className="hidden"
          />
          
          {error && <p className="text-red-500 mt-4 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>
      )}

      {analyzing && (
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">Tahlil qilinmoqda...</h3>
          <p className="text-sm text-gray-500">Gemini AI ovqatni o'rganmoqda</p>
        </div>
      )}

      {result && !analyzing && (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-in slide-in-from-bottom-4 flex flex-col h-full max-h-full">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">{result.mealName}</h3>
          
          <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-bold">Tarkibi (Ustiga bosib o'chiring):</p>
          
          <div className="space-y-3 mb-6 overflow-y-auto pr-2 w-full flex-1">
            {result.ingredients.map((ing, idx) => (
              <label key={idx} onClick={() => toggleIngredient(idx)} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors touch-manipulation active:scale-[0.98] ${ing.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${ing.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}>
                    {ing.checked && <Check size={16} strokeWidth={3} />}
                  </div>
                  <span className={`font-semibold text-lg ${ing.checked ? 'text-emerald-900' : 'text-gray-500 line-through'}`}>{ing.name}</span>
                </div>
                <span className={`font-bold text-lg ${ing.checked ? 'text-emerald-600' : 'text-gray-400'}`}>{ing.calories} kkal</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100 shrink-0">
            <span className="font-bold text-gray-600 text-lg">Jami kaloriya:</span>
            <span className="text-3xl font-black text-gray-800">{calculateTotal()} <span className="text-base font-bold text-gray-500">kkal</span></span>
          </div>

          <div className="flex gap-4 shrink-0">
            <button 
              onClick={() => setResult(null)} 
              className="flex-1 py-4 text-lg bg-gray-100 text-gray-700 font-bold rounded-2xl active:scale-95 touch-manipulation"
            >
              Bekor qilish
            </button>
            <button 
              onClick={handleSave} 
              className="flex-1 py-4 text-lg bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 touch-manipulation"
            >
              Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FoodList({ title, data, addFoodLog }) {
  const [search, setSearch] = useState('');
  
  const filtered = data.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (item) => {
    addFoodLog({ name: item.name, calories: item.calories, type: 'manual' });
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in w-full">
      <div className="mb-4 sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <input 
          type="text" 
          placeholder="Izlash..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-4 text-base rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      <div className="space-y-3 overflow-y-auto pb-4 w-full">
        {filtered.length > 0 ? filtered.map(item => (
          <div key={item.id} className="bg-white p-4 w-full rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:border-emerald-200 active:bg-gray-50">
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
              <p className="text-base text-gray-500">{item.calories} kkal</p>
            </div>
            <button 
              onClick={() => handleAdd(item)}
              className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors active:scale-95 touch-manipulation shadow-sm"
            >
              <Plus size={24} />
            </button>
          </div>
        )) : (
          <p className="text-center text-gray-400 mt-10 text-lg">Hech narsa topilmadi</p>
        )}
      </div>
    </div>
  );
}

function HistoryTab({ logs, removeFoodLog }) {
  const total = logs.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="h-full flex flex-col animate-in fade-in w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
        Bugungi Yeyilganlar
      </h2>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400 pb-20">
          <Utensils size={64} className="mb-4 opacity-50" />
          <p className="text-lg">Hali hech narsa kiritilmadi</p>
        </div>
      ) : (
        <>
          <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-md mb-6 flex justify-between items-center w-full">
            <span className="font-medium text-emerald-100 text-lg">Jami kaloriya:</span>
            <span className="text-3xl font-bold">{total} kkal</span>
          </div>

          <div className="space-y-3 w-full pb-4">
            {[...logs].sort((a,b) => b.timestamp - a.timestamp).map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden w-full active:bg-gray-50">
                <div className="flex-1 pr-14">
                  <h4 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-base font-bold text-emerald-600">{item.calories} kkal</span>
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md uppercase tracking-wider font-semibold">
                      {item.type === 'ai-analysis' ? 'AI' : 'Qo\'lda'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => removeFoodLog(item.id)}
                  className="absolute right-3 w-12 h-12 flex items-center justify-center text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors active:scale-95 touch-manipulation"
                >
                  <X size={24} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}