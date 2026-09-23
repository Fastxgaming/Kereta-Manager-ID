let financeChart = null;
let activeMapRegion = 'JAWA';
let currentMapScale = 1.0;
let globalTicketMultiplier = 1.0;

const staffCandidates = Object.entries(DRIVER_LEVELS).map(([id, level]) => ({
  id,
  role: `Masinis ${level.name}`,
  salary: level.salary,
  expBonus: `${Math.round((1 - level.bbmEfficiency) * 100)}% efisiensi BBM`,
  desc: `Masinis level ${level.name} dengan ketahanan operasional yang sesuai standar.`,
  hireCost: 0
}));

const UI = {
  renderMap(region = 'jawa') {
    const svg = document.getElementById('route-svg');
    if (!svg) return;

    const stations = stationsData[region] || stationsData.jawa;
    let markup = '';

    for (let index = 0; index < stations.length - 1; index += 1) {
      const start = stations[index];
      const end = stations[index + 1];
      markup += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6" opacity="0.7" />`;
    }

    const surabaya = stations.find(station => station.id === 'surabaya');
    const malang = stations.find(station => station.id === 'malang');
    if (surabaya && malang) {
      markup += `<line x1="${surabaya.x}" y1="${surabaya.y}" x2="${malang.x}" y2="${malang.y}" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6" opacity="0.7" />`;
    }

    stations.forEach(station => {
      markup += `
        <g class="map-station" data-station-id="${station.id}" style="cursor: pointer;" onclick="selectStation('${station.id}')">
          <circle cx="${station.x}" cy="${station.y}" r="12" fill="#0284c7" opacity="0.25" />
          <circle cx="${station.x}" cy="${station.y}" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
          <text x="${station.x}" y="${station.y + 24}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" style="text-shadow: 0 2px 5px #000000, 0 0 3px #000000;">${station.name}</text>
        </g>
      `;
    });

    svg.setAttribute('viewBox', '0 0 1000 360');
    svg.innerHTML = markup;
  },

  zoomMap(direction) {
    const map = document.getElementById('mapCanvas') || document.getElementById('route-svg');
    if (!map) return;

    const minScale = 0.5;
    const maxScale = 2.5;
    const step = 0.25;

    if (direction === 'in') currentMapScale = Math.min(maxScale, currentMapScale + step);
    if (direction === 'out') currentMapScale = Math.max(minScale, currentMapScale - step);
    if (direction === 'reset') currentMapScale = 1.0;

    map.style.transform = `scale(${currentMapScale})`;
    map.style.transformOrigin = 'top left';

    if (typeof gameState !== 'undefined') gameState.currentMapScale = currentMapScale;
    if (typeof Game !== 'undefined') Game.saveGame();
  },

  applyMapScale(scale) {
    const map = document.getElementById('mapCanvas') || document.getElementById('route-svg');
    if (!map) return;

    currentMapScale = Number.isFinite(scale) ? Math.min(2.5, Math.max(0.5, scale)) : 1.0;
    map.style.transform = `scale(${currentMapScale})`;
    map.style.transformOrigin = 'top left';

  },

  toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme_mode', isLight ? 'light' : 'dark');
  },

  loadTheme() {
    if (localStorage.getItem('theme_mode') === 'light') {
      document.body.classList.add('light-theme');
    }
  },

  formatRupiah(number) {
    if (isNaN(number) || number === null || number === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  },

  updateHeader(money, day, weather, currentEvent) {
    document.getElementById('money').innerText = this.formatRupiah(money);
    document.getElementById('day').innerText = day;

    // Element cuaca & event (jika ada di HTML)
    const weatherElem = document.getElementById('current-weather');
    const eventElem = document.getElementById('current-event');
    const statusWeatherElem = document.getElementById('game-weather-display');
    if (weatherElem) weatherElem.innerText = weather ? weather.name : 'Cerah ☀️';
    if (statusWeatherElem) statusWeatherElem.innerText = weather ? weather.name : 'Cerah';
    if (eventElem) eventElem.innerText = currentEvent ? currentEvent.name : 'Hari Biasa';
  },

  renderUserProfile(userData = {}) {
    const ownerElement = document.getElementById('display-owner');
    const companyElement = document.getElementById('display-company');
    const uidElement = document.getElementById('display-uid');

    if (ownerElement) ownerElement.innerText = userData.ownerName || userData.owner || '-';
    if (companyElement) companyElement.innerText = userData.companyName || userData.company || '-';
    if (uidElement) uidElement.innerText = userData.uid || '-';
  },

  updateClockDisplay() {
    const h = String(gameState.hour).padStart(2, '0');
    const m = String(gameState.minute).padStart(2, '0');
    const s = String(gameState.second).padStart(2, '0');
    const clockElement = document.getElementById('clock-display');
    if (clockElement) {
      clockElement.innerText = `Hari ${gameState.day} | 🕒 ${h}:${m}:${s}`;
    }
    if (typeof updateGameStatusTime === 'function') {
      updateGameStatusTime(gameState.day, gameState.hour, gameState.minute, gameState.second);
    }
  },

  updateGold(amount) {
    const goldElement = document.getElementById('gold-display');
    if (goldElement) goldElement.innerText = `${Number(amount) || 0} Gold`;
  },

  updateBankLoan(amount) {
    const loanText = this.formatRupiah(amount);
    const loanElements = [
      document.getElementById('bank-loan-amount'),
      document.getElementById('bank-debt-display')
    ];
    loanElements.forEach(element => {
      if (element) element.innerText = loanText;
    });
  },

  renameTrain(index) {
    const loco = gameState.fleet[index];
    if (!loco) return;

    const currentName = loco.name;
    const newName = prompt('Masukkan nama baru untuk lokomotif ini:', currentName);

    if (newName && newName.trim() !== '') {
      const trimmedName = newName.trim();
      loco.name = trimmedName;
      Game.saveGame();
      Game.refreshUI();
      UI.showNotification(`Nama kereta berhasil diubah menjadi "${trimmedName}"!`);
    }
  },

  initChart() {
    const canvas = document.getElementById('financeChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (financeChart) financeChart.destroy();

    financeChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Hari 1'],
        datasets: [
          {
            label: 'Pendapatan (Omset)',
            data: [0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Pengeluaran (BBM & Servis)',
            data: [0],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 20,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: context => {
                const value = context.raw || 0;
                return `${context.dataset.label}: ${this.formatRupiah(value)}`;
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              font: { size: 10 },
              callback: value => `Rp ${(value / 1000000).toFixed(0)} Jt`
            }
          },
          x: {
            ticks: {
              font: { size: 10 }
            }
          }
        }
      }
    });
  },

  updateFinanceChart(history = []) {
    if (!financeChart) return;

    const labels = history.map(item => `Hari ${item.day}`);
    const revenues = history.map(item => item.revenue);
    const expenses = history.map(item => item.expense);

    financeChart.data.labels = labels;
    financeChart.data.datasets[0].data = revenues;
    financeChart.data.datasets[1].data = expenses;
    financeChart.update();
  },

  setMapRegion(region) {
    if (region !== 'JAWA' && region !== 'SUMATRA') return;

    activeMapRegion = region;
    document.getElementById('tab-jawa')?.classList.toggle('active', region === 'JAWA');
    document.getElementById('tab-sumatra')?.classList.toggle('active', region === 'SUMATRA');
    if (document.getElementById('route-svg')) this.renderMap(region.toLowerCase());
  },

  getMapRegion() {
    return activeMapRegion;
  },

  updateFreeCoaches(freeCoaches) {
    const economyElement = document.getElementById('free-k3');
    const executiveElement = document.getElementById('free-k1');
    if (economyElement) economyElement.innerText = freeCoaches?.EKONOMI || 0;
    if (executiveElement) executiveElement.innerText = freeCoaches?.EKSEKUTIF || 0;
  },

  renderDrivers(drivers) {
    const driverList = document.getElementById('driver-list');
    if (!driverList) return;

    if (!drivers || drivers.length === 0) {
      driverList.innerHTML = '<p class="empty-state">Belum ada masinis yang direkrut.</p>';
      return;
    }

    driverList.innerHTML = drivers.map(driver => {
      const level = DRIVER_LEVELS[driver.level] || DRIVER_LEVELS.PEMULA;
      const assignment = driver.assignedLocoId
        ? `Lokomotif: ${driver.assignedLocoId}`
        : 'Belum ditugaskan';

      return `
        <div class="card-item">
          <strong>👨‍✈️ ${driver.name}</strong>
          <div><small>Level: <b>${level.name}</b> | Gaji: <b>${this.formatRupiah(level.salary)}/hari</b></small></div>
          <div><small>${assignment}</small></div>
        </div>
      `;
    }).join('');
  },

  showSaveStatus(text) {
    const statusElem = document.getElementById('save-status');
    statusElem.innerText = text;
    setTimeout(() => {
      statusElem.innerText = '';
    }, 2000);
  },

  renderFleet(fleet) {
    const fleetList = document.getElementById('fleet-list');
    if (!fleetList) return;
    
    if (!fleet || fleet.length === 0) {
      fleetList.innerHTML = '<p class="empty-state">Belum ada lokomotif. Beli di toko terlebih dahulu.</p>';
      return;
    }

    const routeOptionsHTML = ROUTES.map((route, rIndex) => `
      <option value="${rIndex}">${route.origin} ➔ ${route.destination} (${route.durationSeconds}s)</option>
    `).join('');

    fleetList.innerHTML = fleet.map((item, index) => {
      const totalCoaches = item.coaches ? item.coaches.length : 0;
      const isFull = totalCoaches >= item.maxCoaches;
      const isReady = item.status === 'Siap Jalan';
      const condition = item.condition ?? 100;
      const needRepair = condition < 100;
      const repairCost = item.repairCost || (LOCOMOTIVES[item.id] ? LOCOMOTIVES[item.id].repairCost : 15000000);

      return `
        <div class="card-item">
          <strong>🚆 ${item.name} (#${index + 1})</strong>
          <div><small>Status: <b>${item.status}</b> | Kondisi Mesin: <b>${condition}%</b></small></div>
          <div><small>Rangkaian: ${totalCoaches} / ${item.maxCoaches} Gerbong</small></div>
          <div><small>Detail: ${item.coaches && item.coaches.length > 0 ? item.coaches.map(c => c.name).join(', ') : 'Belum ada gerbong'}</small></div>
          
          ${isReady ? `
            <div class="card-actions">
              <button class="btn-action" onclick="UI.renameTrain(${index})">✏️ Ubah Nama</button>
              <button class="btn-action" onclick="Game.attachCoach(${index}, 'EKONOMI')" ${isFull ? 'disabled' : ''}>+ Ekonomi</button>
              <button class="btn-action" onclick="Game.attachCoach(${index}, 'EKSEKUTIF')" ${isFull ? 'disabled' : ''}>+ Eksekutif</button>
              ${needRepair ? `<button class="btn-action" style="background-color:#e74c3c" onclick="Game.repairLocomotive(${index})">🛠️ Servis (${this.formatRupiah(repairCost)})</button>` : ''}
            </div>
            
            <div style="margin-top: 10px;">
              <label><small>Pilih Rute Perjalanan:</small></label>
              <select id="route-select-${index}" style="width: 100%; padding: 6px; margin-top: 4px; border-radius: 4px; border: 1px solid #ccc;">
                ${routeOptionsHTML}
              </select>
            </div>

            <button class="btn-start" onclick="Game.startTrip(${index})">Jalankan Kereta</button>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  renderActiveTrips(activeTrips) {
    const tripsContainer = document.getElementById('active-trips-container') || document.getElementById('active-trips');
    if (!tripsContainer) return;

    const countElement = document.getElementById('active-trains-count');
    if (countElement) countElement.textContent = `${activeTrips?.length || 0} Kereta Aktif`;

    if (!activeTrips || activeTrips.length === 0) {
      tripsContainer.innerHTML = '<p id="no-active-trips" class="empty-state">Belum ada kereta yang sedang beroperasi. Berangkatkan kereta di menu Operasional Rute.</p>';
      return;
    }

    tripsContainer.innerHTML = activeTrips.map(trip => {
      const timeLeft = Math.max(0, trip.timeLeft || 0);
      const minutesLeft = Math.floor(timeLeft / 60);
      const secondsLeft = timeLeft % 60;
      const progress = Math.round((trip.progress || 0) * 100);
      const currentMinutes = (gameState.hour * 60) + gameState.minute + Math.ceil(timeLeft / 60);
      const arrivalHour = Math.floor((currentMinutes % 1440) / 60);
      const arrivalMinute = currentMinutes % 60;
      const eta = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;

      return `
        <div class="active-trip-item">
          <div class="active-trip-main">
            <div>
              <strong>${trip.trainName}</strong>
              <div class="active-trip-route">${trip.origin} ➔ ${trip.destination}</div>
            </div>
            <div class="active-trip-eta">
              <strong>Sisa: ${minutesLeft}m ${String(secondsLeft).padStart(2, '0')}s</strong>
              <small>Jam Tiba: ${eta} WIB</small>
            </div>
          </div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${progress}%"></div></div>
          <small>Cuaca: <b>${trip.weather?.name || 'Cerah ☀️'}</b> | Estimasi Omset: ${this.formatRupiah(trip.revenue)} | BBM: ${this.formatRupiah(trip.fuelCost)}</small>
        </div>
      `;
    }).join('');
  },

  // Render Loop Canvas
  startMapLoop(getActiveTripsFn, getCurrentRegionFn) {
    const canvas = document.getElementById('mapCanvas');
    const svg = document.getElementById('route-svg');
    if (!canvas && svg) {
      this.renderMap(getCurrentRegionFn().toLowerCase());
      return;
    }
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentRegion = getCurrentRegionFn();
      this.applyMapScale(gameState.currentMapScale);

      const filteredRoutes = ROUTES.filter(route => route.region === currentRegion);
      const filteredStations = Object.values(STATIONS).filter(station => station.region === currentRegion);

      // 1. Gambar Rel Putus-putus
      filteredRoutes.forEach(route => {
        const originSt = STATIONS[route.originKey];
        const destSt = STATIONS[route.destKey];

        if (originSt && destSt) {
          ctx.beginPath();
          ctx.moveTo(originSt.x, originSt.y);
          ctx.lineTo(destSt.x, destSt.y);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 2. Gambar Stasiun
      filteredStations.forEach(st => {
        ctx.beginPath();
        ctx.arc(st.x, st.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.fillText(st.name, st.x, st.y + 20);
      });

      // 3. Gambar Kereta Berjalan (Smooth Interpolation)
      const activeTrips = getActiveTripsFn();
      if (activeTrips && activeTrips.length > 0) {
        activeTrips.forEach(trip => {
          const originSt = STATIONS[trip.originKey];
          const destSt = STATIONS[trip.destKey];

          if (originSt && destSt && originSt.region === currentRegion) {
            const currentProgress = Math.min(1, trip.progress || 0);

            const currentX = originSt.x + (destSt.x - originSt.x) * currentProgress;
            const currentY = originSt.y + (destSt.y - originSt.y) * currentProgress;

            // Titik Kereta Interaktif
            ctx.beginPath();
            ctx.arc(currentX, currentY, 9, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label Kereta
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#dc2626';
            ctx.textAlign = 'center';
            ctx.fillText(`🚆 ${trip.trainName}`, currentX, currentY - 12);
          }
          });
      }

      requestAnimationFrame(animate);
    };

    animate();
  },

  showNotification(message) {
    alert(message);
  }
};

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    refreshMenuData();
    if (modalId === 'modal-leaderboard') fetchLeaderboardData();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function selectStation(stationId) {
  const station = Object.values(stationsData)
    .flat()
    .find(item => item.id === stationId);
  if (!station) return;

  const region = stationsData.jawa.includes(station) ? 'jawa' : 'sumatra';
  const index = stationsData[region].indexOf(station);
  const originSelect = document.getElementById('station-origin');
  const destinationSelect = document.getElementById('station-destination');
  if (originSelect && destinationSelect) {
    originSelect.value = `${region}_${index}`;
    calculateRouteDetails();
  }
}

function refreshMenuData() {
  if (typeof gameState === 'undefined') return;

  const economy = document.getElementById('garasi-ekonomi');
  const executive = document.getElementById('garasi-eksekutif');
  const debt = document.getElementById('bank-debt-display');
  if (economy) economy.textContent = gameState.inventoryCoaches?.EKONOMI || 0;
  if (executive) executive.textContent = gameState.inventoryCoaches?.EKSEKUTIF || 0;
  if (debt) debt.textContent = UI.formatRupiah(gameState.bankLoan || 0);

  const fleetList = document.getElementById('garasi-daftar-lokomotif');
  if (fleetList) {
    fleetList.innerHTML = gameState.fleet?.length
      ? gameState.fleet.map(loco => `<p><strong>${loco.name}</strong> - ${loco.status || 'Siap Jalan'}</p>`).join('')
      : '<p class="empty-state">Belum ada lokomotif.</p>';
  }

  const trainSelect = document.getElementById('select-active-train');
  const routeSelect = document.getElementById('route-select');
  if (trainSelect) {
    trainSelect.innerHTML = '<option value="">-- Pilih Kereta --</option>';
    (gameState.fleet || []).forEach((loco, index) => {
      trainSelect.insertAdjacentHTML('beforeend', `<option value="${index}">${loco.name} (${loco.status || 'Siap Jalan'})</option>`);
    });
  }
  if (routeSelect) {
    const region = gameState.currentRegion || 'JAWA';
    routeSelect.innerHTML = ROUTES
      .map((route, index) => ({ route, index }))
      .filter(item => item.route.region === region)
      .map(item => `<option value="${item.index}">${item.route.origin} ➔ ${item.route.destination}</option>`)
      .join('');
  }
}

function renderMarketplace() {
  const select = document.getElementById('marketplace-sell-loco');
  const container = document.getElementById('marketplace-listings');
  if (select) {
    select.innerHTML = '<option value="">-- Pilih Lokomotif --</option>'
      + (gameState.fleet || []).map((loco, index) => `<option value="${index}">${loco.name}</option>`).join('');
  }
  if (container) {
    const listings = MarketplaceSystem.getListings();
    container.innerHTML = listings.length
      ? listings.map(listing => `
        <div class="dealer-item">
          <strong>${listing.locomotive.name}</strong>
          <small>Penjual: ${listing.sellerName}</small>
          <span class="dealer-price">${UI.formatRupiah(listing.price)}</span>
          <button onclick="buyMarketplaceListing('${listing.id}')">Beli Lokomotif</button>
        </div>
      `).join('')
      : '<p class="empty-state">Belum ada listing di bursa.</p>';
  }
}

function sellMarketplaceLocomotive() {
  const index = Number(document.getElementById('marketplace-sell-loco')?.value);
  const price = Number(document.getElementById('marketplace-sell-price')?.value);
  const result = MarketplaceSystem.listLocomotive(index, price);
  UI.showNotification(result.success ? 'Lokomotif berhasil dipasang di bursa.' : result.message);
  if (result.success) renderMarketplace();
}

function buyMarketplaceListing(listingId) {
  const result = MarketplaceSystem.buyListing(listingId);
  UI.showNotification(result.success ? 'Lokomotif berhasil dibeli.' : result.message);
  if (result.success) renderMarketplace();
}

function renderDealerList() {
  const locoContainer = document.getElementById('loko-dealer-list');
  const carriageContainer = document.getElementById('gerbong-dealer-list');

  if (locoContainer) {
    locoContainer.innerHTML = trainUnits.map(unit => `
      <div class="dealer-item">
        <img src="${unit.img}" alt="${unit.name}" onerror="this.src='https://img.icons8.com/color/96/train.png'">
        <strong>${unit.name}</strong>
        <small>⚡ ${unit.speed} | Kapasitas: ${unit.capacity} Gerbong</small>
        <span class="dealer-price">Rp ${unit.price.toLocaleString('id-ID')}</span>
        <p>${unit.desc || ''}</p>
        <button onclick="buyLoco('${unit.id}')">Beli Lokomotif</button>
      </div>
    `).join('');
  }

  if (carriageContainer) {
    carriageContainer.innerHTML = carriageClasses.map(carriage => `
      <div class="dealer-item">
        <img src="${carriage.img}" alt="${carriage.name}" onerror="this.src='https://img.icons8.com/color/96/train.png'">
        <strong>${carriage.name}</strong>
        <small>👥 Kapasitas: ${carriage.capacity} Kursi</small>
        <small>Kenyamanan: ${carriage.comfort || carriage.comfortRating || '-'}</small>
        <span class="dealer-price">Rp ${carriage.price.toLocaleString('id-ID')}</span>
        <button onclick="buyCarriage('${carriage.id}')">Beli Gerbong</button>
      </div>
    `).join('');
  }

  if (typeof renderPremiumDealerCards === 'function') renderPremiumDealerCards();
}

function switchDealerTab(tab) {
  const locomotiveTab = document.getElementById('dealer-tab-lokomotif');
  const carriageTab = document.getElementById('dealer-tab-gerbong');
  const locomotiveButton = document.getElementById('tab-btn-loko');
  const carriageButton = document.getElementById('tab-btn-gerbong');
  const showLocomotives = tab === 'lokomotif';

  if (locomotiveTab) locomotiveTab.style.display = showLocomotives ? 'block' : 'none';
  if (carriageTab) carriageTab.style.display = showLocomotives ? 'none' : 'block';
  if (locomotiveButton) {
    locomotiveButton.style.background = showLocomotives ? '#0284c7' : '#334155';
    locomotiveButton.style.color = showLocomotives ? 'white' : '#94a3b8';
  }
  if (carriageButton) {
    carriageButton.style.background = showLocomotives ? '#334155' : '#0284c7';
    carriageButton.style.color = showLocomotives ? '#94a3b8' : 'white';
  }
}

function buyLoco(unitId) {
  const unit = trainUnits.find(item => item.id === unitId);
  if (!unit || typeof gameState === 'undefined') return;

  if (gameState.money < unit.price) {
    UI.showNotification('Uang kas Anda tidak cukup!');
    return;
  }

  const speed = Number.parseInt(unit.speed, 10) || 80;
  gameState.money -= unit.price;
  Game.recordExpense(unit.price);
  gameState.fleet.push({
    id: unit.id.toUpperCase(),
    name: unit.name,
    price: unit.price,
    maxCoaches: unit.capacity,
    topSpeed: speed,
    fuelCostPerSec: 1500000,
    repairCost: 15000000,
    coaches: [],
    status: 'Siap Jalan',
    condition: 100,
    durability: 100
  });
  Game.saveGame();
  Game.refreshUI();
  refreshMenuData();
}

function buyCarriage(carriageId) {
  const carriage = carriageClasses.find(item => item.id === carriageId);
  if (!carriage || typeof gameState === 'undefined') return;

  if (gameState.money < carriage.price) {
    UI.showNotification('Uang kas Anda tidak cukup!');
    return;
  }

  gameState.money -= carriage.price;
  Game.recordExpense(carriage.price);
  gameState.freeCarriages = gameState.freeCarriages || {};
  gameState.freeCarriages[carriage.id] = (gameState.freeCarriages[carriage.id] || 0) + 1;

  // Stok lama tetap diperbarui agar alur attachCoach yang sudah ada kompatibel.
  if (carriage.id.includes('ekonomi')) gameState.inventoryCoaches.EKONOMI += 1;
  if (carriage.id.includes('eksekutif')) gameState.inventoryCoaches.EKSEKUTIF += 1;
  Game.saveGame();
  Game.refreshUI();
  refreshMenuData();
}

function renderSDMList() {
  const container = document.getElementById('sdm-recruitment-list');
  if (!container) return;

  container.innerHTML = staffCandidates.map(staff => `
    <div class="dealer-item">
      <strong>${staff.role}</strong>
      <small>Gaji: ${UI.formatRupiah(staff.salary)}/hari</small>
      <small>Bonus Efisiensi: ${staff.expBonus}</small>
      <p>${staff.desc}</p>
      <button onclick="hireStaff('${staff.id}')">Rekrut (Biaya: ${UI.formatRupiah(staff.hireCost)})</button>
    </div>
  `).join('');
}

function hireStaff(staffId) {
  const staff = staffCandidates.find(candidate => candidate.id === staffId);
  if (!staff || typeof Game === 'undefined') return;

  Game.hireDriver(staff.id);
  renderSDMList();
}

function updateTicketPriceLabel(value) {
  const multiplier = Number(value);
  const label = document.getElementById('ticket-multiplier-val');
  const summary = document.getElementById('ticket-sales-summary');
  if (!Number.isFinite(multiplier)) return;

  globalTicketMultiplier = multiplier;
  if (label) label.textContent = `${multiplier.toFixed(1)}x (${multiplier > 1 ? 'Harga VIP' : multiplier < 1 ? 'Diskon Promo' : 'Harga Normal'})`;
  if (!summary) return;

  const trips = typeof gameState !== 'undefined' ? gameState.activeTrips || [] : [];
  summary.innerHTML = trips.length
    ? trips.map(trip => `<div><strong>${trip.trainName}</strong>: ${UI.formatRupiah(Math.round((trip.revenue || 0) * multiplier))} estimasi pendapatan</div>`).join('')
    : '<p class="empty-state">Belum ada kereta yang sedang beroperasi.</p>';
}

function populateStationDropdowns() {
  const originSelect = document.getElementById('station-origin');
  const destinationSelect = document.getElementById('station-destination');
  if (!originSelect || !destinationSelect) return;

  let jawaOptions = '<optgroup label="--- PULAU JAWA ---">';
  stationsData.jawa.forEach((station, index) => {
    jawaOptions += `<option value="jawa_${index}">${station.name}</option>`;
  });
  jawaOptions += '</optgroup>';

  let sumatraOptions = '<optgroup label="--- PULAU SUMATERA ---">';
  stationsData.sumatra.forEach((station, index) => {
    sumatraOptions += `<option value="sumatra_${index}">${station.name}</option>`;
  });
  sumatraOptions += '</optgroup>';

  const defaultOption = '<option value="">-- Pilih Stasiun --</option>';
  originSelect.innerHTML = defaultOption + jawaOptions + sumatraOptions;
  destinationSelect.innerHTML = defaultOption + jawaOptions + sumatraOptions;
  document.getElementById('route-info-box').style.display = 'none';
}

function getSelectedStationPair() {
  const originValue = document.getElementById('station-origin')?.value;
  const destinationValue = document.getElementById('station-destination')?.value;
  if (!originValue || !destinationValue) return { origin: null, destination: null, region: null };

  const [originRegion, originIndex] = originValue.split('_');
  const [destinationRegion, destinationIndex] = destinationValue.split('_');
  if (originRegion !== destinationRegion) return { origin: null, destination: null, region: originRegion };

  const stations = stationsData[originRegion];
  const parsedOriginIndex = Number.parseInt(originIndex, 10);
  const parsedDestinationIndex = Number.parseInt(destinationIndex, 10);
  return {
    origin: stations?.[parsedOriginIndex] ? { ...stations[parsedOriginIndex], index: parsedOriginIndex } : null,
    destination: stations?.[parsedDestinationIndex] ? { ...stations[parsedDestinationIndex], index: parsedDestinationIndex } : null,
    region: originRegion,
    originIndex: parsedOriginIndex,
    destinationIndex: parsedDestinationIndex,
    crossRegion: originRegion !== destinationRegion
  };
}

function getRouteDistance(origin, destination) {
  return Math.max(1, Math.abs(origin.index - destination.index) * 85);
}

function calculateRouteDetails() {
  const originValue = document.getElementById('station-origin')?.value;
  const destinationValue = document.getElementById('station-destination')?.value;
  const infoBox = document.getElementById('route-info-box');
  if (!originValue || !destinationValue || originValue === destinationValue) {
    if (infoBox) infoBox.style.display = 'none';
    return;
  }

  const [originRegion, originIndexText] = originValue.split('_');
  const [destinationRegion, destinationIndexText] = destinationValue.split('_');
  if (originRegion !== destinationRegion) {
    alert('Rute antar-pulau belum terhubung jembatan/penyeberangan kereta!');
    document.getElementById('station-destination').value = '';
    if (infoBox) infoBox.style.display = 'none';
    return;
  }

  const originIndex = Number.parseInt(originIndexText, 10);
  const destinationIndex = Number.parseInt(destinationIndexText, 10);
  const distance = Math.abs(originIndex - destinationIndex) * 85;
  let category;
  let ticketBasePrice;
  if (distance <= 150) {
    category = '🟢 Jarak Dekat (Lokal / Komuter)';
    ticketBasePrice = 15000 + (distance * 150);
  } else if (distance <= 500) {
    category = '🟡 Jarak Menengah (Intercity)';
    ticketBasePrice = 50000 + (distance * 250);
  } else {
    category = '🔴 Jarak Jauh (Lintas Pulau / Eksekutif)';
    ticketBasePrice = 120000 + (distance * 350);
  }

  const finalPrice = Math.round(ticketBasePrice * globalTicketMultiplier);
  const locomotive = gameState?.fleet?.find(item => item.status === 'Siap Jalan');
  document.getElementById('route-category').textContent = category;
  document.getElementById('route-distance').textContent = distance.toLocaleString('id-ID');
  document.getElementById('route-revenue').textContent = `${finalPrice.toLocaleString('id-ID')} / penumpang`;
  infoBox.style.display = 'block';
}

const previousOpenModal = window.openModal;
window.openModal = function(modalId) {
  if (typeof previousOpenModal === 'function') previousOpenModal(modalId);
  if (modalId === 'modal-dealer') {
    renderDealerList();
    switchDealerTab('lokomotif');
  }
  if (modalId === 'modal-sdm') renderSDMList();
  if (modalId === 'modal-rute') populateStationDropdowns();
  if (modalId === 'modal-tiket') {
    updateTicketPriceLabel(document.getElementById('ticket-price-slider')?.value || 1);
  }
  if (modalId === 'modal-marketplace') renderMarketplace();
  if (modalId === 'modal-leaderboard') {
    updatePlayerLeaderboardData();
    fetchLeaderboardData();
  }
};

function startTrainJourney() {
  const trainSelect = document.getElementById('select-active-train');
  const locoIndex = Number(trainSelect?.value);
  const { origin, destination, region } = getSelectedStationPair();
  if (!Number.isInteger(locoIndex) || !origin || !destination || origin.id === destination.id) {
    UI.showNotification('Pilih lokomotif, stasiun asal, dan stasiun tujuan terlebih dahulu.');
    return;
  }

  const originKey = `CUSTOM_${origin.id.toUpperCase()}`;
  const destinationKey = `CUSTOM_${destination.id.toUpperCase()}`;
  STATIONS[originKey] = { ...origin, id: originKey, region: region.toUpperCase() };
  STATIONS[destinationKey] = { ...destination, id: destinationKey, region: region.toUpperCase() };

  const distanceTotal = getRouteDistance(origin, destination);
  const routeIndex = ROUTES.push({
    id: `CUSTOM_${origin.id}_${destination.id}_${Date.now()}`,
    region: region.toUpperCase(),
    originKey,
    destKey: destinationKey,
    origin: origin.name,
    destination: destination.name,
    durationSeconds: Math.max(5, Math.ceil(distanceTotal / 80)),
    distanceTotal,
    multiplier: distanceTotal >= 300 ? 1.2 : 1.0
  }) - 1;
  const routeInput = document.getElementById(`route-select-${locoIndex}`) || document.createElement('select');
  routeInput.id = `route-select-${locoIndex}`;
  routeInput.innerHTML = `<option value="${routeIndex}">Rute Pilihan</option>`;
  routeInput.value = String(routeIndex);
  if (!routeInput.parentElement) routeInput.hidden = true;
  if (!routeInput.parentElement) document.body.appendChild(routeInput);
  Game.startTrip(locoIndex);
  closeModal('modal-rute');
}

function updatePlayerLeaderboardData() {
  const uid = getCurrentUserUid();
  if (uid === '-' || !window.db?.collection) return;

  const timestamp = window.firebase?.firestore?.FieldValue?.serverTimestamp
    ? window.firebase.firestore.FieldValue.serverTimestamp()
    : new Date();
  window.db.collection('leaderboard').doc(uid).set({
    uid,
    companyName: currentUserData?.companyName || 'PT Kereta Nusantara',
    ownerName: currentUserData?.ownerName || 'Direktur Utama',
    totalKas: gameState?.money || 0,
    fleetCount: gameState?.fleet?.length || 0,
    updatedAt: timestamp
  }, { merge: true }).catch(error => {
    console.error('Gagal sinkronisasi data leaderboard:', error);
  });
}

function fetchLeaderboardData() {
  const tbody = document.getElementById('leaderboard-table-body');
  if (!tbody || !window.db?.collection) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#38bdf8;">Mengambil peringkat terbaru...</td></tr>';
  window.db.collection('leaderboard')
    .orderBy('totalKas', 'desc')
    .limit(10)
    .get()
    .then(querySnapshot => {
      let markup = '';
      let rank = 1;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        let rankBadge = String(rank);
        if (rank === 1) rankBadge = '🥇 1';
        else if (rank === 2) rankBadge = '🥈 2';
        else if (rank === 3) rankBadge = '🥉 3';
        const totalKas = Number(data.totalKas) || 0;
        const isCurrentPlayer = data.uid === getCurrentUserUid();

        markup += `
          <tr style="border-bottom:1px solid #1e293b;background:${isCurrentPlayer ? 'rgba(56,189,248,0.1)' : 'transparent'};">
            <td style="padding:10px;font-weight:bold;color:#facc15;">${rankBadge}</td>
            <td style="padding:10px;font-weight:bold;color:#f8fafc;">${data.companyName || '-'}</td>
            <td style="padding:10px;color:#cbd5e1;">${data.ownerName || '-'}</td>
            <td style="padding:10px;color:#22c55e;font-weight:bold;">Rp ${totalKas.toLocaleString('id-ID')}</td>
            <td style="padding:10px;color:#38bdf8;">${data.fleetCount || 0} Unit</td>
          </tr>
        `;
        rank += 1;
      });

      tbody.innerHTML = markup || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">Belum ada data perusahaan terdaftar.</td></tr>';
    })
    .catch(error => {
      console.error('Gagal memuat leaderboard:', error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#ef4444;">Gagal memuat data dari database.</td></tr>';
    });
}

function getCurrentUserUid() {
  return window.auth?.currentUser?.uid || currentUserData?.uid || '-';
}

function updateAdminPanelVisibility(userData = {}) {
  const button = document.getElementById('btn-admin-panel');
  if (button) button.style.display = userData.isAdmin === true ? 'flex' : 'none';
  const uidElement = document.getElementById('user-uid-display');
  if (uidElement) uidElement.textContent = userData.uid || getCurrentUserUid();
}

function hasAdminAccess() {
  return currentUserData?.isAdmin === true;
}

document.addEventListener('click', event => {
  if (event.target.classList.contains('modal-overlay')) closeModal(event.target.id);
});

setInterval(updatePlayerLeaderboardData, 60000);