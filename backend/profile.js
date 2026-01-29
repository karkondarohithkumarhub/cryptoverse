// js/profile.js
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Replace this URL with your backend endpoint
        const userId = localStorage.getItem("userId") || "1"; // Example: store userId in localStorage
        const res = await fetch(`http://localhost:3001/api/wallet/${userId}`);
        const data = await res.json();

        // Fill profile header
        document.querySelector(".profile-header h1").textContent = data.userId || "CryptoTrader_01";
        document.querySelector(".profile-header p").textContent = data.userEmail || "user@example.com";

        // Optional: show KYC status dynamically if available
        // document.querySelector(".profile-header div").textContent = data.kycVerified ? "✓ KYC Verified" : "✗ Not Verified";

        // Fill profile stats
        const stats = document.querySelectorAll(".profile-stats .stat-card div");

        stats[0].textContent = `₹${data.balance?.toLocaleString() || "0"}`; // Total Volume
        stats[1].textContent = data.transactions?.length || "0"; // Trades
        stats[2].textContent = new Date(data.createdAt || Date.now()).toLocaleString("default", { month: "short", year: "numeric" }); // Member Since

    } catch (err) {
        console.error("Failed to load profile:", err);
    }
});
