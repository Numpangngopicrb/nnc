// Konfigurasi Firebase
const firebaseConfig = {
  databaseURL: "https://antrian-kedai-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referensi database
const antrianRef = database.ref("antrian");

// Elemen UI
const ambilBtn = document.getElementById("ambilAntrianBtn");
const prosesBtn = document.getElementById("prosesAntrianBtn");
const selesaiBtn = document.getElementById("selesaiBtn");
const antrianSaatIni = document.getElementById("antrianSaatIni");
const antrianSelesai = document.getElementById("antrianSelesai");

// State antrian lokal
let queue = [];
let current = null;
let doneCount = 0;

// Listener realtime
antrianRef.on("value", (snapshot) => {
  const data = snapshot.val() || { queue: [], current: null, done: 0 };
  queue = data.queue || [];
  current = data.current || null;
  doneCount = data.done || 0;

  antrianSaatIni.textContent = current ? `#${current}` : "-";
  antrianSelesai.textContent = doneCount;
});

// Ambil Antrian Baru
ambilBtn.addEventListener("click", () => {
  const nextNumber = Date.now(); // Pakai timestamp sebagai nomor unik
  queue.push(nextNumber);
  updateData();
  alert(`Nomor antrian Anda: #${nextNumber}`);
});

// Proses Antrian
prosesBtn.addEventListener("click", () => {
  if (queue.length === 0) {
    alert("Tidak ada antrian.");
    return;
  }
  current = queue.shift();
  updateData();
});

// Selesai Antrian
selesaiBtn.addEventListener("click", () => {
  if (!current) {
    alert("Tidak ada antrian yang sedang diproses.");
    return;
  }
  current = null;
  doneCount += 1;
  updateData();
});

// Simpan ke Firebase
function updateData() {
  antrianRef.set({
    queue: queue,
    current: current,
    done: doneCount
  });
}
