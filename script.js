// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBA0kQTRed4MuEjqojRjC3J2LiQPl6JNaY",
    authDomain: "swara-mpi-23b.firebaseapp.com",
    projectId: "swara-mpi-23b",
    storageBucket: "swara-mpi-23b.firebasestorage.app",
    messagingSenderId: "639234057858",
    appId: "1:639234057858:web:f7d33bed0b79f21796b69b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const { jsPDF } = window.jspdf;

// --- DATA ---
const memberNames = ["Bukhoiri Ridwan", "Novi Amelia", "Rania Azira", "Ranty Selvia", "Rifatun Nisa Al-Adila", "Siti Mardiah", "Siti Rosidah", "Rizkya Nazwa", "Siti Khadizah", "Uswatun Hasanah", "Wardatushofia", "Zauharatul Aulia", "Akhmad Qosyairi", "Ahmad Rijani", "Diana Ahmad", "Elya Bidari", "Evy Noormala", "Gitalis Tamara Putri Mei Dina", "Hidayatun Ni'mah", "Husna Azizah", "Ismi Fitriani", "Lutfiah Putri Juta Lestari", "Muhammad Qurratulaini", "Muhammad Baichaki Maulana", "Muhammad Islami", "Muhammad Luthfi", "Muhammad Royyan Hidayat", "Nadia Ulfah", "Ghina Kamilah Arni", "Nisrin", "Casilda Imelia Sari", "Ahmad Mihbali", "Muhammad Jery Royfaldo"];
const correctPassword = "MPI_2023";
const adminNIMs = ['230101050652', '230101050111', '230101050110', '230101050683'];
const viewerNIMs = ['230101050102', '230101050110', '230101050111', '230101050112', '230101050113', '230101050114', '230101050115', '230101050273', '230101050274', '230101050275', '230101050276', '230101050277', '230101050651', '230101050652', '230101050665', '230101050666', '230101050667', '230101050669', '230101050670', '230101050672', '230101050674', '230101050675', '230101050676', '230101050678', '230101050679', '230101050680', '230101050681', '230101050683', '230101050764', '230101050765', '230101050766', '230101050768', 'Dina Hermina', '230101050663', '220101050238'];


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
        fetchSavedGroups('saved-groups-list', true);
    }
}

function handleLogin() {
    const pj = document.getElementById('pj-name').value;
    const course = document.getElementById('course-name').value;
    const lecturer = document.getElementById('lecturer-name').value;
    const password = document.getElementById('password').value;

    if (!pj || !course || !lecturer) {
        alert('Semua data PJ harus diisi.');
        return;
    }
    if (password !== correctPassword) {
        alert('Password salah!');
        return;
    }

    document.getElementById('display-pj').innerText = pj;
    document.getElementById('display-course').innerText = course;
    document.getElementById('display-lecturer').innerText = lecturer;
    sessionStorage.setItem('groupInfo', JSON.stringify({ pj, course, lecturer, role: 'admin' }));
    showPage('main-app');
    buildManualGroupUI();
}

function handleViewerLogin() {
    const nim = document.getElementById('nim-viewer').value;
    if (viewerNIMs.includes(nim)) {
        sessionStorage.setItem('groupInfo', JSON.stringify({ role: 'viewer' }));
        showPage('viewer-view');
        fetchSavedGroups('viewer-groups-list', false);
    } else {
        alert('NIM tidak terdaftar. Silakan coba lagi.');
    }
}

function logout() {
    sessionStorage.removeItem('groupInfo');
    document.getElementById('pj-name').value = '';
    document.getElementById('course-name').value = '';
    document.getElementById('lecturer-name').value = '';
    document.getElementById('password').value = '';
    document.getElementById('nim-viewer').value = '';
    showPage('login-page');
}

document.addEventListener('DOMContentLoaded', () => {
    const savedInfo = sessionStorage.getItem('groupInfo');
    if (savedInfo) {
        const userInfo = JSON.parse(savedInfo);
        if (userInfo.role === 'admin') {
            document.getElementById('display-pj').innerText = userInfo.pj;
            document.getElementById('display-course').innerText = userInfo.course;
            document.getElementById('display-lecturer').innerText = userInfo.lecturer;
            showPage('main-app');
            buildManualGroupUI();
            fetchSavedGroups('saved-groups-list', true);
        } else if (userInfo.role === 'viewer') {
            showPage('viewer-view');
            fetchSavedGroups('viewer-groups-list', false);
        }
    }
});

// --- FUNGSI PEMBAGIAN ACAK ---
function generateRandomGroups(method) {
    let membersToShuffle = [...memberNames];
    const rijaIndex = membersToShuffle.indexOf("Ahmad Rijani");
    let rija = null;
    if (rijaIndex > -1) rija = membersToShuffle.splice(rijaIndex, 1)[0];
    for (let i = membersToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [membersToShuffle[i], membersToShuffle[j]] = [membersToShuffle[j], membersToShuffle[i]];
    }
    if (rija) {
        const randomIndex = Math.floor(Math.random() * (membersToShuffle.length - 1)) + 1;
        membersToShuffle.splice(randomIndex, 0, rija);
    }
    let groups = [];
    if (method === 'byGroupCount') {
        const numGroups = parseInt(document.getElementById('num-groups').value);
        if (!numGroups || numGroups <= 0) { alert("Masukkan jumlah kelompok yang valid."); return; }
        groups = divideIntoNChunks(membersToShuffle, numGroups);
    } else {
        const numMembers = parseInt(document.getElementById('num-members').value);
        if (!numMembers || numMembers <= 0) { alert("Masukkan jumlah anggota per kelompok yang valid."); return; }
        groups = chunkArray(membersToShuffle, numMembers);
    }
    displayGroupResults(groups, 'random-result', true);
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) chunks.push(array.slice(i, i + chunkSize));
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
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'manual-group';
    div.innerHTML = `<h4>Kelompok 1</h4>`;
    memberNames.forEach(member => {
        div.innerHTML += `<input type="checkbox" id="manual-${member}-1" name="group-1" value="${member}"><label for="manual-${member}-1">${member}</label><br>`;
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
        div.innerHTML += `<input type="checkbox" id="manual-${member}-${manualGroupCount}" name="group-${manualGroupCount}" value="${member}"><label for="manual-${member}-${manualGroupCount}">${member}</label><br>`;
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
    for (let i = 1; i <= manualGroupCount; i++) {
        const groupMembers = [];
        const checkboxes = document.querySelectorAll(`input[name="group-${i}"]:checked`);
        if (checkboxes.length === 0) continue;
        checkboxes.forEach(cb => {
            if (usedMembers.has(cb.value)) { alert(`Error: ${cb.value} sudah ada di kelompok lain!`); isError = true; }
            groupMembers.push(cb.value);
            usedMembers.add(cb.value);
        });
        if (isError) return;
        groups.push(groupMembers);
    }
    if (groups.length === 0) { alert("Anda belum membuat kelompok apapun."); return; }
    displayGroupResults(groups, 'manual-result', false);
    saveGroupsToFirebase(groups, 'Manual');
}

async function saveGroupsToFirebase(groups, method) {
    const groupInfo = JSON.parse(sessionStorage.getItem('groupInfo'));
    if (!groupInfo || groupInfo.role !== 'admin') { alert("Informasi PJ/Matkul tidak ditemukan. Silakan login ulang."); return; }
    const transformedGroups = groups.map((memberArray, index) => ({ groupName: `Kelompok ${index + 1}`, members: memberArray }));
    const { role, ...payloadInfo } = groupInfo;
    const payload = { ...payloadInfo, method, groups: transformedGroups, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    try {
        await db.collection('groupDivisions').add(payload);
        document.getElementById('thank-you-message').innerText = `Kelompok berhasil disimpan!`;
        showPage('thank-you-page');
        setTimeout(() => { showPage('main-app'); showTab('group-details'); }, 2000);
    } catch (error) {
        console.error("Error saving to Firebase: ", error);
        alert("Gagal menyimpan data. Coba lagi.");
    }
}

// Global variable to store fetched data to pass to the PDF function
let fetchedGroupsData = [];

async function fetchSavedGroups(containerId, isAdmin) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Memuat data...</p>';
    try {
        const snapshot = await db.collection('groupDivisions').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = '<p>Belum ada data kelompok yang tersimpan.</p>'; return;
        }
        
        fetchedGroupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        container.innerHTML = '';
        fetchedGroupsData.forEach((data, index) => {
            const item = document.createElement('div');
            item.className = 'saved-group-item';

            // Tombol-tombol (Hapus dan Unduh)
            let buttonsHTML = '';
            if (isAdmin) {
                buttonsHTML += `<button class="delete-button" onclick="confirmDelete('${data.id}', '${containerId}')">Hapus</button>`;
            } else {
                // Pass the index to identify the correct data object
                buttonsHTML += `<button class="download-button" onclick="downloadGroupPDF(${index})">Unduh PDF</button>`;
            }

            const groupCardsHTML = data.groups.map(groupObject => {
                const membersHTML = groupObject.members.map(m => `<li>${m}</li>`).join('');
                return `<div class="group-card"><h3>${groupObject.groupName}</h3><ul>${membersHTML}</ul></div>`;
            }).join('');

            item.innerHTML = `
                <div class="saved-group-header">
                    <div>
                        <h3>${data.course}</h3>
                        <p style="margin:0; font-size: 0.9em;">Dosen: ${data.lecturer} | PJ: ${data.pj} | Metode: ${data.method}</p>
                    </div>
                    <div class="header-buttons">${buttonsHTML}</div>
                </div>
                <div class="saved-group-body">${groupCardsHTML}</div>`;
            container.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
        container.innerHTML = '<p>Gagal memuat data. Coba lagi nanti.</p>';
    }
}

function downloadGroupPDF(index) {
    const data = fetchedGroupsData[index];
    if (!data) {
        alert("Data kelompok tidak ditemukan!");
        return;
    }

    const doc = new jsPDF();
    let y = 15; // Posisi vertikal awal

    // Judul
    doc.setFontSize(18);
    doc.text(`Pembagian Kelompok - ${data.course}`, 105, y, { align: 'center' });
    y += 10;

    // Info
    doc.setFontSize(11);
    doc.text(`Dosen Pengampu: ${data.lecturer}`, 14, y);
    y += 6;
    doc.text(`Penanggung Jawab (PJ): ${data.pj}`, 14, y);
    y += 10;

    // Garis pemisah
    doc.line(14, y, 196, y);
    y += 10;

    // Data Kelompok
    data.groups.forEach(group => {
        if (y > 270) { // Jika mendekati akhir halaman, buat halaman baru
            doc.addPage();
            y = 15;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(group.groupName, 14, y);
        y += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        group.members.forEach(member => {
            if (y > 280) { // Halaman baru jika daftar anggota panjang
                 doc.addPage();
                 y = 15;
            }
            doc.text(`- ${member}`, 20, y);
            y += 7;
        });
        y += 5; // Jarak antar kelompok
    });

    // Simpan file
    doc.save(`Kelompok_${data.course.replace(/\s/g, '_')}.pdf`);
}


function confirmDelete(docId, containerId) {
    const nim = prompt("Untuk menghapus, masukkan NIM Admin:");
    if (nim && adminNIMs.includes(nim)) {
        if (confirm("Apakah Anda yakin ingin menghapus data kelompok ini secara permanen?")) {
            deleteGroup(docId, containerId);
        }
    } else if (nim) {
        alert("NIM Admin tidak valid.");
    }
}

async function deleteGroup(docId, containerId) {
    try {
        await db.collection('groupDivisions').doc(docId).delete();
        alert("Data berhasil dihapus.");
        fetchSavedGroups(containerId, true); // Refresh list
    } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Gagal menghapus data.");
    }
}





