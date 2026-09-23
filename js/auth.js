let currentUserData = null;
const ADMIN_UIDS = [
  'ACAXxWgTzdNweVchnpAsXvd9fvI3'
];

const Auth = {
  STORAGE_KEY: 'KMI_AUTH_USER',
  isRegisterMode: false,
  profileData: {},

  init() {
    const savedUser = localStorage.getItem(this.STORAGE_KEY);
    if (savedUser) {
      currentUserData = JSON.parse(savedUser);
      this.profileData = currentUserData;
      this.renderProfile(currentUserData);
      this.unlock();
    }

    if (window.auth?.onAuthStateChanged) {
      window.auth.onAuthStateChanged(user => {
        const overlay = document.getElementById('auth-overlay');

        if (user) {
          if (user.emailVerified) {
            this.loadUserData(user.uid, ADMIN_UIDS.includes(user.uid));
          } else {
            alert('Email kamu belum diverifikasi! Silakan cek Gmail kamu dan klik link verifikasi terlebih dahulu.');
            window.auth.signOut();
            if (overlay) overlay.style.display = 'flex';
            document.body.classList.add('auth-locked');
          }
        } else {
          if (overlay) overlay.style.display = 'flex';
          document.body.classList.add('auth-locked');
        }
      });
    }
  },

  loadUserData(uid, isAdmin = false) {
    if (!uid) return;

    if (!window.db || typeof window.db.collection !== 'function') {
      console.error('Firestore belum dikonfigurasi sebagai db global.');
      return;
    }

    window.db.collection('players').doc(uid).get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data.isBanned === true) {
            alert('Akun ini telah dibanned oleh Admin.');
            window.auth.signOut();
            return;
          }
          currentUserData = { ...data, uid, isAdmin };
          this.profileData = currentUserData;
          console.log('Data pemain berhasil dimuat:', data);
          if (typeof updateAdminPanelVisibility === 'function') updateAdminPanelVisibility(currentUserData);
          if (typeof initializePlayer === 'function') initializePlayer(uid, isAdmin);
          if (isAdmin) console.log('Akses admin diaktifkan untuk UID:', uid);

          const companyElement = document.getElementById('display-company');
          const ownerElement = document.getElementById('display-owner');
          const uidElement = document.getElementById('display-uid');

          if (companyElement) companyElement.innerText = currentUserData.companyName || '-';
          if (ownerElement) ownerElement.innerText = currentUserData.ownerName || '-';
          if (uidElement) uidElement.innerText = uid;
          this.renderProfile(currentUserData);

          const overlay = document.getElementById('auth-overlay');
          if (overlay) overlay.style.display = 'none';
          document.body.classList.remove('auth-locked');
        } else {
          console.warn('Dokumen pemain belum ada di Firestore untuk UID:', uid);
        }
      })
      .catch(error => {
        console.error('Gagal mengambil data dari Firestore:', error);
      });
  },

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    document.getElementById('register-fields').style.display = this.isRegisterMode ? 'block' : 'none';
    document.getElementById('btn-submit').innerText = this.isRegisterMode ? 'Daftar' : 'Masuk';
    document.querySelector('.btn-link').innerText = this.isRegisterMode
      ? 'Sudah punya akun? Masuk'
      : 'Belum punya akun? Daftar';
    this.showMessage('');
  },

  submit() {
    const email = document.getElementById('auth-email').value.trim().toLowerCase();
    const password = document.getElementById('auth-pass').value;

    if (!email || !password) {
      this.showMessage('Email dan kata sandi wajib diisi.', true);
      return;
    }

    if (this.isRegisterMode) {
      const owner = document.getElementById('auth-owner').value.trim();
      const company = document.getElementById('auth-company').value.trim();
      if (!owner || !company) {
        this.showMessage('Nama pemilik dan perusahaan wajib diisi.', true);
        return;
      }

      if (!window.auth || !window.db) {
        this.showMessage('Firebase belum siap. Silakan coba lagi.', true);
        return;
      }

      window.auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          const user = userCredential.user;
          return window.db.collection('players').doc(user.uid).set({
            uid: user.uid,
            ownerName: owner,
            companyName: company,
            email,
            createdAt: new Date()
          }).then(() => user);
        })
        .then(user => {
          return user.sendEmailVerification();
        })
        .then(() => {
          alert(`Pendaftaran berhasil! Link verifikasi telah dikirim ke ${email}. Silakan cek kotak masuk/spam Gmail kamu untuk memverifikasi akun sebelum masuk.`);
          return window.auth.signOut();
        })
        .then(() => {
          location.reload();
        })
        .catch(error => {
          alert(`Gagal Daftar: ${error.message}`);
        });
      return;
    }

    if (window.auth) {
      window.auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          const user = userCredential.user;
          if (!user.emailVerified) {
            return window.auth.signOut().then(() => {
              this.showMessage('Akun belum terverifikasi. Silakan cek email dan folder spam.', true);
            });
          }

          return this.loadUserData(user.uid, ADMIN_UIDS.includes(user.uid));
        })
        .catch(error => this.showMessage(`Gagal masuk: ${error.message}`, true));
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null');
    if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
      this.showMessage('Email atau kata sandi tidak sesuai.', true);
      return;
    }

    currentUserData = savedUser;
    this.profileData = currentUserData;
    this.renderProfile(currentUserData);
    this.unlock();
  },

  renderProfile(userData = {}) {
    const owner = userData.ownerName || userData.owner || 'Pemilik';
    const company = userData.companyName || userData.company || 'Perusahaan Tanpa Nama';
    const firebaseUser = window.firebase?.auth?.().currentUser;
    const email = userData.email || firebaseUser?.email || '-';
    const uid = userData.uid || firebaseUser?.uid || '-';

    document.getElementById('display-company').innerText = company;
    document.getElementById('display-owner').innerText = owner;
    document.getElementById('display-uid').innerText = uid;
    document.getElementById('modal-owner').innerText = owner;
    document.getElementById('modal-company').innerText = company;
    document.getElementById('modal-email').innerText = email;
    document.getElementById('modal-uid').innerText = uid;
  },

  openProfileModal() {
    const firebaseUser = window.firebase?.auth?.().currentUser;
    const activeUid = firebaseUser?.uid || currentUserData?.uid || '-';
    const activeEmail = firebaseUser?.email || currentUserData?.email || '-';

    if (!currentUserData && !firebaseUser) return;

    const owner = currentUserData?.ownerName || currentUserData?.owner || '-';
    const company = currentUserData?.companyName || currentUserData?.company || '-';

    const ownerElement = document.getElementById('modal-owner');
    const companyElement = document.getElementById('modal-company');
    const emailElement = document.getElementById('modal-email');
    const uidElement = document.getElementById('modal-uid');
    const modal = document.getElementById('profile-modal');

    if (ownerElement) ownerElement.innerText = owner;
    if (companyElement) companyElement.innerText = company;
    if (emailElement) emailElement.innerText = activeEmail;
    if (uidElement) uidElement.innerText = activeUid;
    if (modal) modal.style.display = 'flex';
  },

  closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
  },

  logout() {
    if (!confirm('Apakah kamu yakin ingin keluar dari akun ini?')) return;

    const signOut = window.firebase?.auth
      ? window.firebase.auth().signOut()
      : Promise.resolve();

    signOut.then(() => {
      alert('Berhasil keluar.');
      localStorage.removeItem(this.STORAGE_KEY);
      currentUserData = null;
      this.profileData = {};
      location.reload();
    }).catch(error => {
      alert(`Gagal keluar dari akun: ${error.message}`);
    });
  },

  deleteAccount() {
    const user = window.firebase?.auth?.().currentUser;
    if (!user) return;

    if (!confirm('PERINGATAN: Semua progress game dan data akun kamu akan dihapus permanen! Lanjutkan?')) return;

    const deleteProfile = window.db?.collection
      ? window.db.collection('players').doc(user.uid).delete()
      : Promise.resolve();

    deleteProfile
      .then(() => user.delete())
      .then(() => {
        alert('Akun berhasil dihapus permanen.');
        localStorage.removeItem(this.STORAGE_KEY);
        currentUserData = null;
        location.reload();
      })
      .catch(error => {
        alert(`Gagal menghapus akun: ${error.message}\n(Jika gagal, silakan login ulang terlebih dahulu lalu coba lagi)`);
      });
  },

  resetPassword() {
    const email = document.getElementById('auth-email').value.trim();

    if (!email) {
      alert('Silakan masukkan alamat Gmail kamu terlebih dahulu!');
      return;
    }

    if (!window.firebase || typeof window.firebase.auth !== 'function') {
      alert('Firebase Authentication belum dikonfigurasi pada aplikasi ini.');
      return;
    }

    window.firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert('Email instruksi reset kata sandi telah dikirim ke Gmail kamu. Silakan cek Inbox/Spam!');
      })
      .catch(error => {
        alert(`Gagal mengirim email: ${error.message}`);
      });
  },

  unlock() {
    document.getElementById('auth-overlay').style.display = 'none';
    document.body.classList.remove('auth-locked');
  },

  showMessage(message, isError = false) {
    const messageElement = document.getElementById('auth-message');
    messageElement.innerText = message;
    messageElement.classList.toggle('error', isError);
  }
};

document.body.classList.add('auth-locked');
document.addEventListener('DOMContentLoaded', () => Auth.init());
