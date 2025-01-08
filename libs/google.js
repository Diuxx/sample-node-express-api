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

// page elements
const googleSignInBtn = document.getElementById('google-signin-btn');
const signOutBtn = document.getElementById('google-logout-btn');
const userPhoto = document.getElementById('user-photo');
const logoutElement = document.getElementById('logout');

// verify connection state.
auth.onAuthStateChanged((user) => {
    if (user) {
        // hide before try to load.
        console.log('(try to connect)');
        connectedShowElements(user);
        connectApi(user.uid, user.displayName);
    } 
    else {
        // manage disconnected elements
        console.log("(disconnected)");
        hideAllElements('.connected');
        showExample();
    }
});

// Connection with Google
googleSignInBtn.addEventListener('click', () => {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => auth.signInWithPopup(provider))
        .then(async (result) => {
            const user = result.user;
            connectedShowElements(user);
            const data = await retrieveApiKey(user.uid, user.displayName)
        })
        .catch((error) => {
            disconnectedRemoveElements();
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

function disconnect() {
    auth.signOut()
        .then(() => {
            hideAllElements('.connected');
            this.disconnectedRemoveElements();
            showExample();
        })
        .catch((error) => {
            console.error('Erreur lors de la déconnexion :', error);
        });
}

function connectedShowElements(user) {
    console.log(`(connected) uid : ${user.displayName} ${user.uid}`)
    showNotification(`Connected with google account as ${user.displayName}`, 'success');

    userPhoto.src = user.photoURL;
}

function disconnectedRemoveElements() {
    googleSignInBtn.style.display = 'inline-block';
    logoutElement.style.display = 'none';
    userPhoto.src = '../libs/icons8-google.svg';
}