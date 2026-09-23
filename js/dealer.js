// Dealer premium yang hanya menggunakan mata uang Gold dari top-up/admin.
class LocomotiveDealer {
	static getPremiumList() {
		return [
			{
				id: 'loko_gold_cc206',
				name: 'CC206 Livery Vintage Gold Edition',
				priceGold: 500,
				horsepower: 2250,
				fuelEfficiencyPerk: '+15%',
				history: 'Lokomotif edisi terbatas dengan performa tinggi untuk penarikan kargo berat.'
			}
		];
	}
}

class CarriageDealer {
	static getPremiumList() {
		return [
			{
				id: 'gerbong_panoramic',
				name: 'Gerbong Panoramic Luxury',
				priceGold: 300,
				passengerMultiplier: '+35% Tarif Tiket',
				comfortScore: 100,
				history: 'Gerbong kaca eksklusif dengan pemandangan 360 derajat untuk rute pariwisata.'
			}
		];
	}
}

function renderPremiumDealerCards() {
	const locomotiveContainer = document.getElementById('loko-dealer-list');
	const carriageContainer = document.getElementById('gerbong-dealer-list');

	if (locomotiveContainer) {
		locomotiveContainer.insertAdjacentHTML('afterbegin', LocomotiveDealer.getPremiumList().map(unit => `
			<div class="dealer-item premium-dealer-item">
				<strong>✨ ${unit.name}</strong>
				<small>${unit.rarity || 'PREMIUM'} | ${unit.horsepower} HP | Efisiensi BBM ${unit.fuelEfficiencyPerk}</small>
				<span class="dealer-price">${unit.priceGold} Gold</span>
				<p>${unit.history}</p>
				<button onclick="buyPremiumLocomotive('${unit.id}')">Beli dengan Gold</button>
			</div>
		`).join(''));
	}

	if (carriageContainer) {
		carriageContainer.insertAdjacentHTML('afterbegin', CarriageDealer.getPremiumList().map(carriage => `
			<div class="dealer-item premium-dealer-item">
				<strong>✨ ${carriage.name}</strong>
				<small>${carriage.comfortScore}/100 | Bonus: ${carriage.passengerMultiplier}</small>
				<span class="dealer-price">${carriage.priceGold} Gold</span>
				<p>${carriage.history}</p>
				<button onclick="buyPremiumCarriage('${carriage.id}')">Beli dengan Gold</button>
			</div>
		`).join(''));
	}
}

function buyPremiumLocomotive(unitId) {
	const unit = LocomotiveDealer.getPremiumList().find(item => item.id === unitId);
	if (!unit || typeof gameState === 'undefined') return;
	if (gameState.gold < unit.priceGold) {
		UI.showNotification('Gold tidak cukup. Silakan lakukan top-up terlebih dahulu.');
		return;
	}

	gameState.gold -= unit.priceGold;
	gameState.fleet.push({
		...unit,
		id: unit.id.toUpperCase(),
		maxCoaches: unit.capacity,
		topSpeed: Number.parseInt(unit.speed, 10) || 100,
		fuelCostPerSec: 1250000,
		repairCost: 15000000,
		coaches: [],
		status: 'Siap Jalan',
		condition: 100,
		durability: 100
	});
	Game.saveGame();
	Game.refreshUI();
	UI.showNotification(`${unit.name} berhasil dibeli dengan ${unit.priceGold} Gold.`);
}

function buyPremiumCarriage(carriageId) {
	const carriage = CarriageDealer.getPremiumList().find(item => item.id === carriageId);
	if (!carriage || typeof gameState === 'undefined') return;
	if (gameState.gold < carriage.priceGold) {
		UI.showNotification('Gold tidak cukup. Silakan lakukan top-up terlebih dahulu.');
		return;
	}

	gameState.gold -= carriage.priceGold;
	gameState.premiumCarriages = gameState.premiumCarriages || [];
	gameState.premiumCarriages.push({ ...carriage });
	Game.saveGame();
	Game.refreshUI();
	UI.showNotification(`${carriage.name} berhasil dibeli dengan ${carriage.priceGold} Gold.`);
}
