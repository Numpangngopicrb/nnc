// Konfigurasi Firebase
const firebaseConfig = {
  databaseURL: "https://antrian-kedai-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const antrianRef = database.ref("antrian");

// Elemen
const ambilBtn = document.getElementById("ambilAntrianBtn");
const prosesBtn = document.getElementById("prosesAntrianBtn");
const selesaiBtn = document.getElementById("selesaiBtn");
const antrianSaatIni = document.getElementById("antrianSaatIni");
const antrianSelesai = document.getElementById("antrianSelesai");
const daftarAntrian = document.getElementById("daftarAntrian");

// Data lokal
let queue = [];
let current = null;
let doneCount = 0;

// Listener realtime
antrianRef.on("value", (snapshot) => {
  const data = snapshot.val() || { queue: [], current: null, done: 0 };
  queue = data.queue || [];
  current = data.current || null;
  doneCount = data.done || 0;

  // Bersihkan antrian lama (>15 menit)
  const now = Date.now();
  queue = queue.filter((item) => now - item.timestamp <= 15 * 60 * 1000);

  // Tampilkan
  antrianSaatIni.textContent = current ? `#${current.nomor}` : "-";
  antrianSelesai.textContent = doneCount;
  daftarAntrian.innerHTML = "";

  queue.forEach((item) => {
    const li = document.createElement("li");
    const minutes = Math.floor((now - item.timestamp) / 60000);
    li.innerHTML = `<span>#${item.nomor}</span> <span class="queue-time">${minutes} menit</span>`;
    daftarAntrian.appendChild(li);
  });

  // Simpan perubahan queue jika ada yang dihapus
  updateData(false);
});

// Ambil Antrian Baru
ambilBtn.addEventListener("click", () => {
  const nomor = Math.floor(1000 + Math.random() * 9000); // Nomor acak
  const timestamp = Date.now();
  queue.push({ nomor, timestamp });
  updateData(true);
  alert(`Nomor antrian Anda: #${nomor}`);
});

// Proses Antrian
prosesBtn.addEventListener("click", () => {
  if (queue.length === 0) {
    alert("Tidak ada antrian.");
    return;
  }
  current = queue.shift();
  updateData(true);
});

// Selesai Antrian
selesaiBtn.addEventListener("click", () => {
  if (!current) {
    alert("Tidak ada antrian yang sedang diproses.");
    return;
  }
  current = null;
  doneCount += 1;
  updateData(true);
});

// Simpan ke Firebase
function updateData(force = true) {
  if (force) {
    antrianRef.set({
      queue: queue,
      current: current,
      done: doneCount
    });
  } else {
    antrianRef.update({ queue });
  }
}
