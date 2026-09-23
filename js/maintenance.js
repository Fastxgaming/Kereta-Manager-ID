// Sistem inspeksi, service, overhaul, dan risiko mogok lokomotif.
class MaintenanceSystem {
	static getDurability(vehicle) {
		return Number.isFinite(vehicle?.durability)
			? vehicle.durability
			: (vehicle?.condition ?? 100);
	}

	static setDurability(vehicle, value) {
		const durability = Math.max(0, Math.min(100, Math.round(value)));
		vehicle.durability = durability;
		vehicle.condition = durability;
		return durability;
	}

	static inspectVehicle(vehicle) {
		const durability = this.getDurability(vehicle);
		return {
			durability,
			odometer: vehicle?.odometer || 0,
			engineStatus: durability < 50 ? 'Kritis (Risiko Mogok)' : 'Normal',
			bogieStatus: durability < 70 ? 'Aus' : 'Baik'
		};
	}

	static performDailyService(player, vehicle) {
		const cost = 2000000;
		if (!player || !vehicle || player.money < cost) return false;

		player.money -= cost;
		this.setDurability(vehicle, this.getDurability(vehicle) + 20);
		Game.recordExpense(cost);
		Game.saveGame();
		Game.refreshUI();
		return true;
	}

	static performOverhaul(player, vehicle) {
		const cost = 15000000;
		if (!player || !vehicle || player.money < cost) return false;

		player.money -= cost;
		this.setDurability(vehicle, 100);
		vehicle.isRepairing = false;
		vehicle.status = 'Siap Jalan';
		Game.recordExpense(cost);
		Game.saveGame();
		Game.refreshUI();
		return true;
	}

	static checkBreakdown(vehicle) {
		return this.getDurability(vehicle) < 50 && Math.random() < 0.3;
	}
}
