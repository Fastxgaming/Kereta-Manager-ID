const SAVE_KEY = 'KMI_SAVE_DATA_V1';

const DEFAULT_STATE = {
  money: 1000000000,
  day: 1,
  hour: 6,
  minute: 0,
  second: 0,
  currentRegion: 'JAWA',
  currentMapScale: 1.0,
  bankLoan: 0,
  drivers: [],
  fleet: [],
  inventoryCoaches: {
    EKONOMI: 0,
    EKSEKUTIF: 0
  },
  activeTrips: [],
  weather: WEATHERS.CLEAR,
  currentEvent: RANDOM_EVENTS[0],
  unlockedAchievements: [],
  financeHistory: [
    { day: 1, revenue: 0, expense: 0 }
  ]
};

let gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));

const Game = {
  init() {
    this.loadGame();
    this.bindEvents();
    UI.loadTheme();
    UI.initChart();
    this.refreshUI();
    this.startGameClock();
    UI.startMapLoop(
      () => gameState.activeTrips,
      () => gameState.currentRegion || 'JAWA'
    );
  },

  saveGame(silent = true) {
    const cleanFleet = gameState.fleet.map(loco => ({
      ...loco,
      status: 'Siap Jalan'
    }));

    const dataToSave = {
      money: isNaN(gameState.money) ? DEFAULT_STATE.money : gameState.money,
      day: gameState.day || 1,
      hour: Number.isFinite(gameState.hour) ? gameState.hour : DEFAULT_STATE.hour,
      minute: Number.isFinite(gameState.minute) ? gameState.minute : DEFAULT_STATE.minute,
      second: Number.isFinite(gameState.second) ? gameState.second : DEFAULT_STATE.second,
      currentRegion: gameState.currentRegion || DEFAULT_STATE.currentRegion,
      currentMapScale: Number.isFinite(gameState.currentMapScale) ? gameState.currentMapScale : DEFAULT_STATE.currentMapScale,
      bankLoan: gameState.bankLoan || 0,
      drivers: gameState.drivers,
      fleet: cleanFleet,
      inventoryCoaches: gameState.inventoryCoaches,
      weather: gameState.weather,
      currentEvent: gameState.currentEvent,
      unlockedAchievements: gameState.unlockedAchievements,
      financeHistory: gameState.financeHistory
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    if (!silent) UI.showSaveStatus('✓ Game Tersimpan');
  },

  loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        gameState.money = (parsed.money && !isNaN(parsed.money)) ? parsed.money : DEFAULT_STATE.money;
        gameState.day = parsed.day ?? DEFAULT_STATE.day;
        gameState.hour = Number.isFinite(parsed.hour) ? parsed.hour : DEFAULT_STATE.hour;
        gameState.minute = Number.isFinite(parsed.minute) ? parsed.minute : DEFAULT_STATE.minute;
        gameState.second = Number.isFinite(parsed.second) ? parsed.second : DEFAULT_STATE.second;
        gameState.currentRegion = parsed.currentRegion === 'SUMATRA' ? 'SUMATRA' : 'JAWA';
        gameState.currentMapScale = Number.isFinite(parsed.currentMapScale)
          ? Math.min(2.5, Math.max(0.5, parsed.currentMapScale))
          : DEFAULT_STATE.currentMapScale;
        gameState.bankLoan = Number.isFinite(parsed.bankLoan) ? Math.max(0, parsed.bankLoan) : DEFAULT_STATE.bankLoan;
        gameState.drivers = Array.isArray(parsed.drivers)
          ? parsed.drivers.map(driver => ({
            ...driver,
            level: DRIVER_LEVELS[driver.level] ? driver.level : 'PEMULA',
            assignedLocoId: driver.assignedLocoId ?? null
          }))
          : [];
        gameState.fleet = (parsed.fleet || []).map(loco => {
          const defaultLoco = LOCOMOTIVES[loco.id] || {};
          return {
            ...defaultLoco,
            ...loco,
            repairCost: loco.repairCost || defaultLoco.repairCost || 15000000,
            fuelCostPerSec: loco.fuelCostPerSec || defaultLoco.fuelCostPerSec || 1500000
          };
        });
        gameState.inventoryCoaches = parsed.inventoryCoaches ?? DEFAULT_STATE.inventoryCoaches;
        gameState.weather = WEATHERS[parsed.weather?.id] || DEFAULT_STATE.weather;
        gameState.currentEvent = RANDOM_EVENTS.find(event => event.id === parsed.currentEvent?.id) || DEFAULT_STATE.currentEvent;
        gameState.unlockedAchievements = Array.isArray(parsed.unlockedAchievements)
          ? parsed.unlockedAchievements
          : [];
        gameState.financeHistory = Array.isArray(parsed.financeHistory) && parsed.financeHistory.length > 0
          ? parsed.financeHistory
          : JSON.parse(JSON.stringify(DEFAULT_STATE.financeHistory));
        if (!gameState.financeHistory.some(history => history.day === gameState.day)) {
          gameState.financeHistory.push({ day: gameState.day, revenue: 0, expense: 0 });
        }
        gameState.activeTrips = [];
      } catch (e) {
        console.error('Gagal memuat save data:', e);
        gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    }
  },

  resetGame() {
    if (confirm('Apakah Anda yakin ingin menghapus semua progres dan memulai dari awal?')) {
      localStorage.removeItem(SAVE_KEY);
      gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.refreshUI();
      UI.showSaveStatus('Game Di-reset');
    }
  },

  refreshUI() {
    UI.applyMapScale(gameState.currentMapScale);
    this.checkAchievements();
    UI.setMapRegion(gameState.currentRegion || 'JAWA');
    UI.updateHeader(gameState.money, gameState.day, gameState.weather, gameState.currentEvent);
    UI.updateClockDisplay();
    UI.updateBankLoan(gameState.bankLoan || 0);
    UI.updateFreeCoaches(gameState.inventoryCoaches);
    UI.renderDrivers(gameState.drivers);
    UI.renderFleet(gameState.fleet);
    UI.renderActiveTrips(gameState.activeTrips);
    UI.updateFinanceChart(gameState.financeHistory);
  },

  checkAchievements() {
    if (!gameState.unlockedAchievements) gameState.unlockedAchievements = [];

    let achievementUnlocked = false;
    ACHIEVEMENTS.forEach(achievement => {
      if (gameState.unlockedAchievements.includes(achievement.id)) return;

      let unlocked = false;
      if (achievement.id === 'FIRST_TRIP') {
        unlocked = gameState.financeHistory.some(history => history.revenue > 0);
      }
      if (achievement.id === 'FLEET_5' && gameState.fleet.length >= 5) unlocked = true;
      if (achievement.id === 'EXPANSION_SUMATRA' && gameState.currentRegion === 'SUMATRA') unlocked = true;

      if (unlocked) {
        gameState.unlockedAchievements.push(achievement.id);
        gameState.money += achievement.reward;
        achievementUnlocked = true;
        UI.showNotification(`🏆 Achievement Unlocked: "${achievement.name}"! Bonus: ${UI.formatRupiah(achievement.reward)}`);
      }
    });

    if (achievementUnlocked) this.saveGame();
  },

  switchRegion(region) {
    if (region !== 'JAWA' && region !== 'SUMATRA') return;

    gameState.currentRegion = region;
    this.saveGame();
    this.refreshUI();
  },

  recordExpense(amount) {
    const currentDayLog = gameState.financeHistory.find(history => history.day === gameState.day);
    if (currentDayLog) currentDayLog.expense += amount;
  },

  startGameClock() {
    if (this.clockTimer) clearInterval(this.clockTimer);

    this.clockTimer = setInterval(() => {
      gameState.minute += 1;
      gameState.second = 0;

      if (gameState.minute >= 60) {
        gameState.minute = 0;
        gameState.hour += 1;
      }

      if (gameState.hour >= 24) {
        gameState.hour = 0;
        this.nextDay();
      }

      UI.updateClockDisplay();
      this.updateActiveTrains();
    }, 1000);
  },

  updateActiveTrains() {
    gameState.activeTrips.slice().forEach(train => {
      if (train.isAtTransitStation) {
        if (!train.transitTimer) {
          train.transitTimer = setTimeout(() => {
            train.isAtTransitStation = false;
            train.transitTimer = null;
            UI.showNotification(`Kereta ${train.trainName} melanjutkan perjalanan dari stasiun transit.`);
          }, 5000);
        }
        return;
      }

      const kmPerMinute = (train.speed || 80) / 60;
      train.progress = Math.min(1, train.progress + kmPerMinute / train.routeDistance);
      train.timeLeft = Math.max(0, train.timeLeft - 1);

      if (train.progress >= 1) {
        train.progress = 1;
        this.onTrainArrived(train);
      }
    });

    UI.renderActiveTrips(gameState.activeTrips);
  },

  onTrainArrived(train) {
    gameState.activeTrips = gameState.activeTrips.filter(activeTrain => activeTrain.id !== train.id);
    train.locoRef.status = 'Siap Jalan';
    train.locoRef.condition = Math.max(0, (train.locoRef.condition || 100) - 10);
    gameState.money += train.revenue;
    SoundSystem.playCoin();
    this.recordRevenue(train.revenue);
    this.saveGame();

    const profit = train.revenue - train.fuelCost;
    UI.showNotification(`Kereta tiba! Omset: ${UI.formatRupiah(train.revenue)} | Profit Bersih: ${UI.formatRupiah(profit)}`);
    this.refreshUI();
  },

  recordRevenue(amount) {
    const currentDayLog = gameState.financeHistory.find(history => history.day === gameState.day);
    if (currentDayLog) currentDayLog.revenue += amount;
  },

  calculateTravelDuration(locomotive, route) {
    const averageSpeed = locomotive.topSpeed || 80;
    const distanceTotal = route.distanceTotal || route.distance || 0;

    if (distanceTotal <= 0) return 0;

    return distanceTotal / averageSpeed;
  },

  hireDriver(levelKey) {
    const driverLevel = DRIVER_LEVELS[levelKey];
    if (!driverLevel) return;

    const driverNumber = gameState.drivers.length + 1;
    gameState.drivers.push({
      id: `DRIVER_${Date.now()}`,
      name: `${driverLevel.name} ${driverNumber}`,
      level: levelKey,
      assignedLocoId: null
    });

    this.saveGame();
    this.refreshUI();
    UI.showNotification(`Masinis ${driverLevel.name} berhasil direkrut.`);
  },

  nextDay() {
    gameState.day += 1;

    gameState.financeHistory.push({
      day: gameState.day,
      revenue: 0,
      expense: 0
    });

    let totalSalary = 0;
    if (gameState.drivers && gameState.drivers.length > 0) {
      gameState.drivers.forEach(driver => {
        const driverLevel = DRIVER_LEVELS[driver.level] || DRIVER_LEVELS.PEMULA;
        totalSalary += driverLevel.salary;
      });
      gameState.money -= totalSalary;
      this.recordExpense(totalSalary);
      UI.showNotification(`Gaji harian ${gameState.drivers.length} masinis sebesar ${UI.formatRupiah(totalSalary)} telah dibayarkan.`);
    }

    const interest = Math.round(gameState.bankLoan * GAME_BALANCE.bankInterestRate);
    if (interest > 0) {
      gameState.money -= interest;
      this.recordExpense(interest);
      UI.showNotification(`Bunga pinjaman bank harian sebesar ${UI.formatRupiah(interest)} telah dipotong.`);
    }

    if (Math.random() < 0.3) {
      const eventIndex = Math.floor(Math.random() * (RANDOM_EVENTS.length - 1)) + 1;
      gameState.currentEvent = RANDOM_EVENTS[eventIndex];
    } else {
      gameState.currentEvent = RANDOM_EVENTS[0];
    }

    gameState.weather = WEATHERS.CLEAR;
    this.saveGame();
    this.refreshUI();
    UI.showNotification(`Hari ke-${gameState.day} dimulai! Event Hari Ini: ${gameState.currentEvent.name}`);
  },

  takeLoan(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;

    gameState.bankLoan = (gameState.bankLoan || 0) + amount;
    gameState.money += amount;
    UI.showNotification(`Pinjaman sebesar ${UI.formatRupiah(amount)} telah disetujui!`);
    this.saveGame();
    this.refreshUI();
  },

  payLoan() {
    if (gameState.bankLoan <= 0) {
      UI.showNotification('Tidak ada hutang bank yang perlu dibayar.');
      return;
    }

    if (gameState.money < gameState.bankLoan) {
      UI.showNotification('Uang kas tidak cukup untuk melunasi hutang bank.');
      return;
    }

    const payment = gameState.bankLoan;
    gameState.money -= payment;
    this.recordExpense(payment);
    gameState.bankLoan = 0;
    UI.showNotification('Hutang bank berhasil dilunasi!');
    this.saveGame();
    this.refreshUI();
  },

  buyLocomotive(typeKey) {
    const locoData = LOCOMOTIVES[typeKey];
    if (gameState.money >= locoData.price) {
      gameState.money -= locoData.price;
      this.recordExpense(locoData.price);
      gameState.fleet.push({
        ...locoData,
        coaches: [],
        status: 'Siap Jalan',
        condition: 100
      });
      this.saveGame();
      this.refreshUI();
    } else {
      UI.showNotification('Uang kas Anda tidak cukup!');
    }
  },

  buyCoach(coachKey) {
    const coachData = COACHES[coachKey];
    if (gameState.money >= coachData.price) {
      gameState.money -= coachData.price;
      this.recordExpense(coachData.price);
      gameState.inventoryCoaches[coachKey] += 1;
      this.saveGame();
      this.refreshUI();
    } else {
      UI.showNotification('Uang kas Anda tidak cukup!');
    }
  },

  attachCoach(locoIndex, coachKey) {
    const loco = gameState.fleet[locoIndex];
    
    if (gameState.inventoryCoaches[coachKey] <= 0) {
      UI.showNotification('Anda tidak memiliki stok gerbong ini! Beli di toko dulu.');
      return;
    }

    if (loco.coaches.length >= loco.maxCoaches) {
      UI.showNotification('Daya tarik lokomotif sudah maksimal!');
      return;
    }

    gameState.inventoryCoaches[coachKey] -= 1;
    loco.coaches.push({ ...COACHES[coachKey] });
    this.saveGame();
    this.refreshUI();
  },

  repairLocomotive(locoIndex) {
    const loco = gameState.fleet[locoIndex];
    const cost = loco.repairCost || LOCOMOTIVES[loco.id]?.repairCost || 15000000;

    if (gameState.money >= cost) {
      gameState.money -= cost;
      this.recordExpense(cost);
      loco.condition = 100;
      this.saveGame();
      this.refreshUI();
      UI.showNotification(`Lokomotif ${loco.name} selesai diservis ke kondisi 100%!`);
    } else {
      UI.showNotification('Uang kas Anda tidak cukup untuk biaya servis!');
    }
  },

  startTrip(locoIndex) {
    const loco = gameState.fleet[locoIndex];

    if (!loco.coaches || loco.coaches.length === 0) {
      UI.showNotification('Kereta tidak bisa jalan tanpa gerbong penumpang!');
      return;
    }

    if (loco.condition <= 20) {
      UI.showNotification('Kondisi lokomotif terlalu buruk (<=20%)! Lakukan servis terlebih dahulu.');
      return;
    }

    const routeSelectElem = document.getElementById(`route-select-${locoIndex}`);
    const selectedRouteIndex = routeSelectElem ? parseInt(routeSelectElem.value) : 0;
    const selectedRoute = ROUTES[selectedRouteIndex];

    const rand = Math.random();
    let currentWeather = WEATHERS.CLEAR;
    if (rand > 0.85) currentWeather = WEATHERS.STORM;
    else if (rand > 0.60) currentWeather = WEATHERS.RAIN;

    const actualDuration = Math.round(selectedRoute.durationSeconds * currentWeather.speedMultiplier);
    const distanceTotal = selectedRoute.distanceTotal || selectedRoute.distance || selectedRoute.durationSeconds * 100;
    const fuelCostPerSec = loco.fuelCostPerSec || LOCOMOTIVES[loco.id]?.fuelCostPerSec || 1500000;
    const fuelCost = Math.round(actualDuration * fuelCostPerSec * currentWeather.fuelMultiplier);

    if (gameState.money < fuelCost) {
      UI.showNotification(`Uang kas tidak cukup untuk membeli BBM Solar (${UI.formatRupiah(fuelCost)})!`);
      return;
    }

    SoundSystem.playHorn();
    gameState.weather = currentWeather;
    gameState.money -= fuelCost;
  this.recordExpense(fuelCost);
  this.saveGame();

    let baseTicketRevenue = 0;
    loco.coaches.forEach(coach => {
      baseTicketRevenue += coach.capacity * coach.ticketPrice;
    });

    const eventMultiplier = gameState.currentEvent ? gameState.currentEvent.ticketMultiplier : 1.0;
    const totalRevenue = Math.round(baseTicketRevenue * selectedRoute.multiplier * eventMultiplier);

    loco.status = 'Berjalan';
    const tripId = Date.now();
    const newTrip = {
      id: tripId,
      trainName: loco.name,
      originKey: selectedRoute.originKey,
      destKey: selectedRoute.destKey,
      origin: selectedRoute.origin,
      destination: selectedRoute.destination,
      progress: 0,
      timeLeft: Math.ceil(distanceTotal / (loco.topSpeed || 80) * 60),
      totalDuration: Math.ceil(distanceTotal / (loco.topSpeed || 80) * 60),
      distanceTotal,
      routeDistance: distanceTotal,
      speed: loco.topSpeed || 80,
      startTime: Date.now(),
      revenue: totalRevenue,
      fuelCost: fuelCost,
      weather: currentWeather,
      locoRef: loco
    };

    gameState.activeTrips.push(newTrip);
    this.refreshUI();
  },

  bindEvents() {
    document.getElementById('buy-cc201-btn').addEventListener('click', () => this.buyLocomotive('CC201'));
    document.getElementById('buy-cc206-btn').addEventListener('click', () => this.buyLocomotive('CC206'));
    document.getElementById('buy-k3-btn').addEventListener('click', () => this.buyCoach('EKONOMI'));
    document.getElementById('buy-k1-btn').addEventListener('click', () => this.buyCoach('EKSEKUTIF'));
    
    document.getElementById('save-btn').addEventListener('click', () => this.saveGame(false));
    document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
    document.getElementById('next-day-btn')?.addEventListener('click', () => this.nextDay());
  }
};

document.addEventListener('DOMContentLoaded', () => Game.init());