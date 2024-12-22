// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBaM6f7T8dDc3XapFhOoAvfWQ36XSUQ53Q",
    authDomain: "lowdata-3b6c2.firebaseapp.com",
    projectId: "lowdata-3b6c2",
    storageBucket: "lowdata-3b6c2.firebasestorage.app",
    messagingSenderId: "41749017855",
    appId: "1:41749017855:web:1ee9c048800d2fb95b08ca",
    measurementId: "G-Q7Q793N4H7"
};

// Initialiser Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Fournisseur Google
const provider = new firebase.auth.GoogleAuthProvider();

const googleSignInBtn = document.getElementById('google-signin-btn');
const signOutBtn = document.getElementById('google-logout-btn');
const userPhoto = document.getElementById('user-photo');
const logoutElement = document.getElementById('logout');

// verify connection state.
auth.onAuthStateChanged((user) => {
    if (user) {
        connectedShowElements(user);
        connectApi();
    } 
    else {
        // manage disconnected elements
        console.log("(disconnected)");
        showExample();
    }
});

// Connection with Google
googleSignInBtn.addEventListener('click', () => {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => auth.signInWithPopup(provider))
        .then((result) => {
            const user = result.user;
            connectedShowElements(user);
            connectApi(user.uid);
        })
        .catch((error) => {
            console.error("Erreur d'authentification :", error.message);
        });
});

signOutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    auth.signOut()
        .then(() => disconnectedRemoveElements())
        .catch((error) => {
            console.error('Erreur lors de la déconnexion :', error);
        });
});

function connectedShowElements(user) {
    console.log(`(connected) uid : ${user.displayName} ${user.uid}`)

    // update elements html
    userPhoto.src = user.photoURL;
    googleSignInBtn.style.display = 'none';
    logoutElement.style.display = 'flex';
}

function disconnectedRemoveElements(user) {
    googleSignInBtn.style.display = 'inline-block';
    logoutElement.style.display = 'none';
}