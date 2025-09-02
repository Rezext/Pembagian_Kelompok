import { initializeApp } from "firebase/app";
// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBA0kQTRed4MuEjqojRjC3J2LiQPl6JNaY",
  authDomain: "swara-mpi-23b.firebaseapp.com",
  projectId: "swara-mpi-23b",
  storageBucket: "swara-mpi-23b.firebasestorage.app",
  messagingSenderId: "639234057858",
  appId: "1:639234057858:web:e375dd824a5e04ff96b69b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- DATA ---
const memberNames = ["Ridwan", "Novi", "Rania", "Ranty", "Rifatun", "Mardiah", "Rosidah", "Rizkya", "Khadizah", "Uswatun", "Shofia", "Aulia", "Qosyairi", "Rijani", "Diana", "Elya", "Evy", "Gitalis", "Dayah", "Husna", "Ismi", "Lutfiah", "Qurratulaini", "Baichaki", "Islami", "Luthfi", "Royyan", "Nadia", "Ghina", "Nisrin", "Casilda", "Mihbali"];
const correctPassword = "MPI_2023";
const adminNIMs = ['230101050652', '230101050111', '230101050110', '230101050683'];

// --- FUNGSI TAMPILAN ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}-content`).classList.add('active');
    if (tabName === 'group-details') {
        fetchSavedGroups();
    }
}

function handleLogin() {
    const pj = document.getElementById('pj-name').value;
    const course = document.getElementById('course-name').value;
    const lecturer = document.getElementById('lecturer-name').value;
    const password = document.getElementById('password').value;

    if (!pj || !course || !lecturer) {
        alert('Semua data harus diisi.');
        return;
    }
    if (password !== correctPassword) {
        alert('Password salah!');
        return;
    }

    document.getElementById('display-pj').innerText = pj;
    document.getElementById('display-course').innerText = course;
    document.getElementById('display-lecturer').innerText = lecturer;
    
    // Simpan info ke session storage agar tidak hilang saat refresh
    sessionStorage.setItem('groupInfo', JSON.stringify({ pj, course, lecturer }));

    showPage('main-app');
    buildManualGroupUI();
}

function logout() {
    sessionStorage.removeItem('groupInfo');
    document.getElementById('pj-name').value = '';
    document.getElementById('course-name').value = '';
    document.getElementById('lecturer-name').value = '';
    document.getElementById('password').value = '';
    showPage('login-page');
}

// Cek jika sudah login sebelumnya
document.addEventListener('DOMContentLoaded', () => {
    const savedInfo = sessionStorage.getItem('groupInfo');
    if (savedInfo) {
        const { pj, course, lecturer } = JSON.parse(savedInfo);
        document.getElementById('display-pj').innerText = pj;
        document.getElementById('display-course').innerText = course;
        document.getElementById('display-lecturer').innerText = lecturer;
        showPage('main-app');
        buildManualGroupUI();
        fetchSavedGroups();
    }
});


// --- FUNGSI PEMBAGIAN ACAK ---
function generateRandomGroups(method) {
    let membersToShuffle = [...memberNames];
    const rijaIndex = membersToShuffle.indexOf("Rijani");
    let rija = null;
    if (rijaIndex > -1) {
        rija = membersToShuffle.splice(rijaIndex, 1)[0];
    }

    // Acak anggota selain Rija
    for (let i = membersToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [membersToShuffle[i], membersToShuffle[j]] = [membersToShuffle[j], membersToShuffle[i]];
    }

    // Tempatkan Rija di posisi acak, tapi bukan di awal
    if (rija) {
        const randomIndex = Math.floor(Math.random() * (membersToShuffle.length - 1)) + 1;
        membersToShuffle.splice(randomIndex, 0, rija);
    }
    
    let groups = [];
    if (method === 'byGroupCount') {
        const numGroups = parseInt(document.getElementById('num-groups').value);
        if (!numGroups || numGroups <= 0) {
            alert("Masukkan jumlah kelompok yang valid.");
            return;
        }
        groups = divideIntoNChunks(membersToShuffle, numGroups);
    } else { // byMemberCount
        const numMembers = parseInt(document.getElementById('num-members').value);
        if (!numMembers || numMembers <= 0) {
            alert("Masukkan jumlah anggota per kelompok yang valid.");
            return;
        }
        groups = chunkArray(membersToShuffle, numMembers);
    }

    displayGroupResults(groups, 'random-result', true);
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function divideIntoNChunks(array, n) {
    const result = Array.from({ length: n }, () => []);
    let groupIndex = 0;
    for (const item of array) {
        result[groupIndex].push(item);
        groupIndex = (groupIndex + 1) % n;
    }
    return result;
}


// --- FUNGSI PEMBAGIAN MANUAL ---
function buildManualGroupUI() {
    const container = document.getElementById('manual-group-builder');
    container.innerHTML = ''; // Kosongkan dulu
    const availableMembers = [...memberNames];
    
    const div = document.createElement('div');
    div.className = 'manual-group';
    div.innerHTML = `<h4>Kelompok 1</h4>`;
    
    availableMembers.forEach(member => {
        div.innerHTML += `
            <input type="checkbox" id="manual-${member}-1" name="group-1" value="${member}">
            <label for="manual-${member}-1">${member}</label><br>
        `;
    });
    container.appendChild(div);
}

let manualGroupCount = 1;
function addManualGroup() {
    manualGroupCount++;
    const container = document.getElementById('manual-group-builder');
    const div = document.createElement('div');
    div.className = 'manual-group';
    div.innerHTML = `<h4>Kelompok ${manualGroupCount}</h4>`;

    memberNames.forEach(member => {
        div.innerHTML += `
            <input type="checkbox" id="manual-${member}-${manualGroupCount}" name="group-${manualGroupCount}" value="${member}">
            <label for="manual-${member}-${manualGroupCount}">${member}</label><br>
        `;
    });
    container.appendChild(div);
}


// --- FUNGSI TAMPILAN & SIMPAN ---
function displayGroupResults(groups, containerId, showSaveButton) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    groups.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = 'group-card';
        let listItems = group.map(member => `<li>${member}</li>`).join('');
        card.innerHTML = `<h3>Kelompok ${index + 1}</h3><ul>${listItems}</ul>`;
        container.appendChild(card);
    });

    if (showSaveButton) {
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Simpan Hasil Acak';
        saveButton.className = 'save-button';
        saveButton.onclick = () => saveGroupsToFirebase(groups, 'Acak');
        container.appendChild(saveButton);
    }
}

function saveManualGroups() {
    const groups = [];
    const usedMembers = new Set();
    let isError = false;

    for(let i=1; i<= manualGroupCount; i++){
        const groupMembers = [];
        const checkboxes = document.querySelectorAll(`input[name="group-${i}"]:checked`);
        if(checkboxes.length === 0) continue;

        checkboxes.forEach(cb => {
            if(usedMembers.has(cb.value)){
                alert(`Error: ${cb.value} sudah ada di kelompok lain!`);
                isError = true;
            }
            groupMembers.push(cb.value);
            usedMembers.add(cb.value);
        });
        if(isError) return;
        groups.push(groupMembers);
    }
    
    if(groups.length === 0){
        alert("Anda belum membuat kelompok apapun.");
        return;
    }

    displayGroupResults(groups, 'manual-result', false);
    saveGroupsToFirebase(groups, 'Manual');
}


async function saveGroupsToFirebase(groups, method) {
    const groupInfo = JSON.parse(sessionStorage.getItem('groupInfo'));
    if (!groupInfo) {
        alert("Informasi PJ/Matkul tidak ditemukan. Silakan login ulang.");
        return;
    }
    
    const payload = {
        ...groupInfo,
        method: method,
        groups: groups,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('groupDivisions').add(payload);
        document.getElementById('thank-you-message').innerText = `Kelompok berhasil disimpan!`;
        showPage('thank-you-page');
        setTimeout(() => {
            showPage('main-app');
            showTab('group-details');
        }, 2000);
    } catch (error) {
        console.error("Error saving to Firebase: ", error);
        alert("Gagal menyimpan data. Coba lagi.");
    }
}

async function fetchSavedGroups() {
    const container = document.getElementById('saved-groups-list');
    container.innerHTML = '<p>Memuat data...</p>';

    try {
        const snapshot = await db.collection('groupDivisions').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = '<p>Belum ada data kelompok yang tersimpan.</p>';
            return;
        }

        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'saved-group-item';

            const groupCardsHTML = data.groups.map((group, index) => {
                const membersHTML = group.map(m => `<li>${m}</li>`).join('');
                return `<div class="group-card"><h3>Kelompok ${index+1}</h3><ul>${membersHTML}</ul></div>`;
            }).join('');

            item.innerHTML = `
                <div class="saved-group-header">
                    <div>
                        <h3>${data.course}</h3>
                        <p style="margin:0; font-size: 0.9em;">Dosen: ${data.lecturer} | PJ: ${data.pj} | Metode: ${data.method}</p>
                    </div>
                    <button class="delete-button" onclick="confirmDelete('${doc.id}')">Hapus</button>
                </div>
                <div class="saved-group-body">
                    ${groupCardsHTML}
                </div>
            `;
            container.appendChild(item);
        });

    } catch (error) {
        console.error("Error fetching data: ", error);
        container.innerHTML = '<p>Gagal memuat data. Coba lagi nanti.</p>';
    }
}

function confirmDelete(docId) {
    const nim = prompt("Untuk menghapus, masukkan NIM Admin:");
    if (nim && adminNIMs.includes(nim)) {
        if (confirm("Apakah Anda yakin ingin menghapus data kelompok ini secara permanen?")) {
            deleteGroup(docId);
        }
    } else if (nim) {
        alert("NIM Admin tidak valid.");
    }
}

async function deleteGroup(docId) {
    try {
        await db.collection('groupDivisions').doc(docId).delete();
        alert("Data berhasil dihapus.");
        fetchSavedGroups(); // Refresh list
    } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Gagal menghapus data.");
    }

}

