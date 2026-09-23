// Sistem PPh dan pajak aset mingguan.
class TaxSystem {
	static processWeeklyTax(player) {
		const weeklyHistory = (player.financeHistory || [])
			.filter(history => history.day < player.day)
			.slice(-7);
		const netProfit = weeklyHistory.reduce(
			(total, history) => total + (history.revenue || 0) - (history.expense || 0),
			0
		);
		const pphRate = 0.10;
		const pphTax = Math.max(0, netProfit * pphRate);
		const assetCount = player.fleet?.length || player.ownedVehicles?.length || 0;
		const assetTax = assetCount * 500000;
		const totalTax = Math.round(pphTax + assetTax);

		if (player.money >= totalTax) {
			player.money -= totalTax;
			player.isTaxFrozen = false;
			return { success: true, totalTax, pphTax, assetTax };
		}

		player.isTaxFrozen = true;
		return {
			success: false,
			totalTax,
			pphTax,
			assetTax,
			message: 'Kas tidak cukup! Akses bursa dibekukan.'
		};
	}
}
