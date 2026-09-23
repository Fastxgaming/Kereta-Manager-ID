// Bursa C2C lokal untuk jual-beli lokomotif antarpemain.
const MarketplaceSystem = {
	getListings() {
		return Array.isArray(gameState.marketplaceListings) ? gameState.marketplaceListings : [];
	},

	listLocomotive(fleetIndex, price) {
		if (gameState.isTaxFrozen) return { success: false, message: 'Akses bursa dibekukan karena pajak belum dibayar.' };
		const locomotive = gameState.fleet[fleetIndex];
		const listingPrice = Math.round(Number(price));
		if (!locomotive || !Number.isFinite(listingPrice) || listingPrice <= 0) {
			return { success: false, message: 'Lokomotif dan harga listing tidak valid.' };
		}
		if (locomotive.status === 'Berjalan') {
			return { success: false, message: 'Lokomotif yang sedang berjalan tidak dapat dijual.' };
		}

		const listing = {
			id: `listing_${Date.now()}`,
			sellerUid: currentPlayerUID || 'local-player',
			sellerName: currentUserData?.companyName || 'Perusahaan Lokal',
			price: listingPrice,
			locomotive: { ...locomotive, coaches: [...(locomotive.coaches || [])] },
			createdAt: Date.now()
		};
		gameState.fleet.splice(fleetIndex, 1);
		gameState.marketplaceListings.push(listing);
		Game.saveGame();
		Game.refreshUI();
		return { success: true, listing };
	},

	buyListing(listingId) {
		if (gameState.isTaxFrozen) return { success: false, message: 'Akses bursa dibekukan karena pajak belum dibayar.' };
		const listingIndex = this.getListings().findIndex(listing => listing.id === listingId);
		const listing = this.getListings()[listingIndex];
		if (!listing) return { success: false, message: 'Listing tidak ditemukan.' };
		if (gameState.money < listing.price) return { success: false, message: 'Kas tidak cukup untuk membeli listing ini.' };

		gameState.money -= listing.price;
		gameState.fleet.push({ ...listing.locomotive, status: 'Siap Jalan' });
		gameState.marketplaceListings.splice(listingIndex, 1);
		Game.recordExpense(listing.price);
		Game.saveGame();
		Game.refreshUI();
		return { success: true };
	}
};
