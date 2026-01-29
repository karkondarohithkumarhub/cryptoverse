
import { getUserProfile } from './api.js'; 

async function loadProfile() {
    try {
        const profile = await getUserProfile();
        if (!profile) return;

        // Update profile header
        document.querySelector('.profile-header h1').innerText = profile.username || 'User';
        document.querySelector('.profile-header p').innerText = profile.email || 'Not set';

        // Format join date
        const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-';
        document.querySelector('.profile-stats .stat-card:nth-child(3) div').innerText = joinDate;

        // Total volume and trades
        document.querySelector('.profile-stats .stat-card:nth-child(1) div').innerText = 
            `₹${profile.totalVolume?.toLocaleString() || '0'}`;
        document.querySelector('.profile-stats .stat-card:nth-child(2) div').innerText = 
            profile.totalTrades || 0;

    } catch (err) {
        console.error('Failed to load profile:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadProfile);
