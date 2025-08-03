// Konfigurasi Firebase
const firebaseConfig = {
  databaseURL: "https://antrian-kedai-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const antrianRef = database.ref("antrian");

// Ambil elemen
const ambilBtn = document.getElementById("ambilAntrianBtn");
const prosesBtn = document.getElementById("prosesAntrianBtn");
const selesaiBtn = document.getElementById("selesaiBtn");
const resetBtn = document.getElementById("resetBtn");

const antrianSaatIni = document.getElementById("antrianSaatIni");
const antrianSelesai = document.getElementById("antrianSelesai");
const daftarAntrian = document.getElementById("daftarAntrian");

const tanggalEl = document.getElementById("tanggal");
const jamEl = document.getElementById("jam");

// State
let queue = [];
let current = null;
let doneCount = 0;

// Realtime listener
antrianRef.on("value", (snapshot) => {
  const data = snapshot.val() || { queue: [], current: null, done: 0 };
  const now = Date.now();

  // Filter antrian lebih dari 15 menit
  queue = (data.queue || []).filter((item) => now - item.timestamp <= 15 * 60 * 1000);
  current = data.current || null;
  doneCount = data.done || 0;

  // Tampilkan data
  antrianSaatIni.textContent = current ? `#${current.nomor}` : "-";
  antrianSelesai.textContent = doneCount;

  // Tampilkan daftar antrian
  daftarAntrian.innerHTML = "";
  queue.forEach((item) => {
    const li = document.createElement("li");
    const menit = Math.floor((now - item.timestamp) / 60000);
    li.innerHTML = `<span>#${item.nomor}</span><span class="queue-time">${menit} menit</span>`;
    daftarAntrian.appendChild(li);
  });

  // Simpan kembali queue yang sudah difilter
  updateData(false);
});

// Tombol Ambil Antrian
ambilBtn.addEventListener("click", () => {
  const nomor = Math.floor(1000 + Math.random() * 9000); // Nomor acak
  const timestamp = Date.now();
  queue.push({ nomor, timestamp });
  updateData(true);
  alert(`Nomor antrian Anda: #${nomor}`);
});

// Tombol Proses Antrian
prosesBtn.addEventListener("click", () => {
  if (queue.length === 0) {
    alert("Tidak ada antrian.");
    return;
  }
  current = queue.shift();
  updateData(true);
});

// Tombol Selesai
selesaiBtn.addEventListener("click", () => {
  if (!current) {
    alert("Tidak ada antrian yang sedang diproses.");
    return;
  }
  current = null;
  doneCount += 1;
  updateData(true);
});

// Tombol Reset
resetBtn.addEventListener("click", () => {
  const konfirmasi = confirm("Yakin ingin mereset semua antrian?");
  if (!konfirmasi) return;
  queue = [];
  current = null;
  doneCount = 0;
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

// Tanggal & Jam Otomatis
function updateWaktu() {
  const now = new Date();
  const hari = now.toLocaleDateString("id-ID", { weekday: 'long' });
  const tanggal = now.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  tanggalEl.textContent = `${hari}, ${tanggal}`;
  jamEl.textContent = jam;
}
setInterval(updateWaktu, 1000);
updateWaktu();
