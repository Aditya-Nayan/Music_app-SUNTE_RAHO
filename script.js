// ===================================
// CONFIGURATION AND DATA
// ===================================

// Placeholder Song Data (In a real app, this would come from a backend API)
const currentSong = {
    title: "Abhi Kuch Dino Se",
    artist: "Mohit Chauhan",
    src: "songs.mp3/mohit-chauhan-abhi-kuch-dino-se.mp3", 
    art: "image.png/abhi_kuch_dinose_image.png"
};

// ===================================
// DOM ELEMENT SELECTIONS
// ===================================

const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn.querySelector('i');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Song Info Elements
const playerSongTitle = document.getElementById('player-song-title');
const playerArtistName = document.getElementById('player-artist-name');
const songArt = document.querySelector('.song-art');


// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * Formats a time in seconds to mm:ss format.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The formatted time string.
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// ===================================
// MUSIC PLAYER LOGIC
// ===================================

/**
 * Toggles the play/pause state of the audio player.
 */
function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
    } else {
        audioPlayer.pause();
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
    }
}

/**
 * Updates the song information displayed in the player bar.
 */
function updateSongInfo(song) {
    playerSongTitle.textContent = song.title;
    playerArtistName.textContent = song.artist;
    audioPlayer.src = song.src;
    songArt.src = song.art;
}

// Initial song load
updateSongInfo(currentSong);


// --- Event Listeners for Player Controls ---

playPauseBtn.addEventListener('click', togglePlayPause);

// When metadata is loaded (gives us the duration)
audioPlayer.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audioPlayer.duration);
    seekBar.max = audioPlayer.duration;
});

// While the song is playing
audioPlayer.addEventListener('timeupdate', () => {
    // Update seek bar position
    seekBar.value = audioPlayer.currentTime;
    // Update current time display
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

// When the user interacts with the seek bar
seekBar.addEventListener('input', () => {
    audioPlayer.currentTime = seekBar.value;
});

// When the song ends
audioPlayer.addEventListener('ended', () => {
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
    // In a real app, you would call a 'playNextSong()' function here.
});

// Volume control
volumeBar.addEventListener('input', () => {
    // Volume is a value between 0 and 1, so divide the 0-100 range by 100
    audioPlayer.volume = volumeBar.value / 100;
});

// --- Simple Next/Previous Button Placeholders ---
// These buttons would require an array of songs to fully function
document.getElementById('next-btn').addEventListener('click', () => {
    alert("Next song functionality would load the next track from the playlist!");
});

document.getElementById('prev-btn').addEventListener('click', () => {
    alert("Previous song functionality would load the previous track from the playlist!");
});

// ===================================
// UI/UX LOGIC (Dark Mode)
// ===================================

/**
 * Toggles the dark-mode class on the body element.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Change the icon from sun to moon and vice-versa
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        darkModeToggle.classList.remove('fa-moon');
        darkModeToggle.classList.add('fa-sun');
    } else {
        darkModeToggle.classList.remove('fa-sun');
        darkModeToggle.classList.add('fa-moon');
    }
    
    // Store preference in localStorage
    localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
}

// Apply dark mode preference on load
(function applyTheme() {
    if (localStorage.getItem('dark-mode') === 'enabled') {
        toggleDarkMode(); // Calling it once applies the mode and sets the correct icon
    }
})();


// Event listener for the toggle button
darkModeToggle.addEventListener('click', toggleDarkMode);

// ===================================
// GLOBAL CONFIGURATION & FIREBASE REFERENCES (Initialized in index.html)
// ===================================
// const app = firebase.app();
// const auth = firebase.auth();
// const db = firebase.firestore();

let currentUserID = null;

// ===================================
// DOM ELEMENT SELECTIONS
// ===================================
// Player Elements (from Part 1)
// ... other player elements ...

// Auth Elements
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const authError = document.getElementById('auth-error');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const closeAuthBtn = authModal.querySelector('.close-btn');

// Playlist Elements
const createPlaylistBtn = document.querySelector('.create-playlist');
const playlistModal = document.getElementById('playlist-modal');
const closePlaylistBtn = document.getElementById('playlist-modal').querySelector('.close-playlist-btn');
const playlistNameInput = document.getElementById('playlist-name-input');
const createPlaylistSubmit = document.getElementById('create-playlist-submit');
const playlistsSection = document.querySelector('.playlists-section'); // Parent container

// ===================================
// MODULE 1: AUTHENTICATION AND UI MANAGEMENT
// ===================================

/**
 * Updates the UI based on the user's logged-in state.
 * @param {firebase.User} user - The currently logged-in user object or null.
 */
function updateAuthUI(user) {
    if (user) {
        currentUserID = user.uid;
        authBtn.textContent = 'Logout';
        authBtn.removeEventListener('click', showAuthModal);
        authBtn.addEventListener('click', handleLogout);
        
        playlistsSection.innerHTML = `
            <h2>Playlists</h2>
            <div class="playlist-list" id="user-playlists"></div>
            <button class="create-playlist"><i class="fas fa-plus"></i> New Playlist</button>
        `;
        // Re-attach listener to the new 'create playlist' button
        document.querySelector('.create-playlist').addEventListener('click', () => {
            playlistModal.style.display = 'block';
        });

        fetchUserPlaylists(); // Load playlists for the logged-in user

    } else {
        currentUserID = null;
        authBtn.textContent = 'Sign Up / Login';
        authBtn.removeEventListener('click', handleLogout);
        authBtn.addEventListener('click', showAuthModal);

        playlistsSection.innerHTML = `
            <h2>Playlists</h2>
            <p>Login to see your playlists.</p>
            <button class="create-playlist" disabled><i class="fas fa-plus"></i> New Playlist</button>
        `;
    }
}

function showAuthModal() {
    authModal.style.display = 'block';
    authError.textContent = '';
}

closeAuthBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
});

closePlaylistBtn.addEventListener('click', () => {
    playlistModal.style.display = 'none';
});

// --- Firebase Auth Handlers ---

loginBtn.addEventListener('click', async () => {
    authError.textContent = '';
    try {
        await auth.signInWithEmailAndPassword(authEmail.value, authPassword.value);
        authModal.style.display = 'none';
    } catch (error) {
        authError.textContent = error.message;
    }
});

signupBtn.addEventListener('click', async () => {
    authError.textContent = '';
    try {
        await auth.createUserWithEmailAndPassword(authEmail.value, authPassword.value);
        authModal.style.display = 'none';
        // After signup, you might want to create a user profile document in Firestore
        await db.collection('users').doc(auth.currentUser.uid).set({
            email: auth.currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        authError.textContent = error.message;
    }
});

async function handleLogout() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// Firebase Auth State Listener (The core of session management)
auth.onAuthStateChanged(updateAuthUI);


// ===================================
// MODULE 2: FIRESTORE (PLAYLIST MANAGEMENT)
// ===================================

/**
 * Fetches and displays a user's playlists from Firestore.
 */
async function fetchUserPlaylists() {
    if (!currentUserID) return;

    const playlistListEl = document.getElementById('user-playlists');
    playlistListEl.innerHTML = 'Loading playlists...';

    try {
        const snapshot = await db.collection('playlists')
                                 .where('ownerId', '==', currentUserID)
                                 .orderBy('createdAt', 'desc')
                                 .get();

        playlistListEl.innerHTML = ''; // Clear loading message

        if (snapshot.empty) {
            playlistListEl.innerHTML = '<p style="padding: 10px;">No playlists yet.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const playlist = doc.data();
            const playlistEl = document.createElement('a');
            playlistEl.href = '#';
            playlistEl.classList.add('nav-item', 'playlist-item');
            playlistEl.innerHTML = `<i class="fas fa-music"></i> ${playlist.name}`;
            // Optional: Add click listener to load playlist songs (future feature)
            playlistEl.addEventListener('click', () => {
                alert(`Loading playlist: ${playlist.name} (ID: ${doc.id})`);
            });
            playlistListEl.appendChild(playlistEl);
        });

    } catch (error) {
        console.error("Error fetching playlists:", error);
        playlistListEl.innerHTML = '<p style="color: red; padding: 10px;">Failed to load playlists.</p>';
    }
}

/**
 * Creates a new playlist document in Firestore.
 */
createPlaylistSubmit.addEventListener('click', async () => {
    if (!currentUserID) return;

    const name = playlistNameInput.value.trim();
    if (name.length < 3) {
        alert("Playlist name must be at least 3 characters long.");
        return;
    }

    try {
        // Add new document to the 'playlists' collection
        await db.collection('playlists').add({
            name: name,
            ownerId: currentUserID,
            trackCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        playlistNameInput.value = ''; // Clear input
        playlistModal.style.display = 'none'; // Close modal
        fetchUserPlaylists(); // Refresh the sidebar list

    } catch (error) {
        alert("Error creating playlist: " + error.message);
        console.error("Error creating playlist:", error);
    }
});

// ===================================
// MODULE 3: MUSIC PLAYER LOGIC (From Part 1, simplified)
// ===================================

// Placeholder Song Data (The next step would be loading this from Firestore/Storage)
// const currentSong = { /* ... data from Part 1 ... */ }; // Removed duplicate declaration

// --- Player Functions (Keep these from Part 1) ---
// function togglePlayPause() { ... }
// function formatTime(seconds) { ... }
// ... (Include all your player functions and event listeners from the original script.js) ...

// **NOTE**: For the sake of a complete, working example, I will keep the placeholder
// player logic from Part 1, ensuring the core functionality remains stable.
// (You would copy the rest of your Part 1 script.js here, including the Dark Mode logic.)