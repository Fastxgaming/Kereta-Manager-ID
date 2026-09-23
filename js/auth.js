const Auth = {
  STORAGE_KEY: 'KMI_AUTH_USER',
  isRegisterMode: false,

  init() {
    const savedUser = localStorage.getItem(this.STORAGE_KEY);
    if (savedUser) this.unlock();
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

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ email, password, owner, company }));
      this.unlock();
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null');
    if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
      this.showMessage('Email atau kata sandi tidak sesuai.', true);
      return;
    }

    this.unlock();
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
