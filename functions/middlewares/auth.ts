const authFireBaseClient = require('../db/firebase-client');


// authorization middlewares
exports.validateFirebaseIdToken = (req, res, next) => {
    // Get user from auth headers.
    // If found set req.user
    // If not found, go to next middleware, the next middleware needs to check for req.user to allow/deny unauthorized access

    // console.log('Check if request is authorized with Firebase ID token');
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !req.cookies.__session && !req.headers.token) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        // res.status(403).send('Unauthorized');
        return next();
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.headers.token) {
        console.log('token', req.headers.token);
        return next();
    } else {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }

    if (idToken) {
        authFireBaseClient.auth().verifyIdToken(idToken).then(decodedIdToken => {
            console.log('ID Token correctly decoded', decodedIdToken);
            req.user = decodedIdToken;
            return next();
        }).catch(error => {
            console.error('Error while verifying Firebase ID token:', error);
            res.status(419).send('Token Expired');
            // return next();
        });
    }

};

// middleware to check for authorized users
exports.authTokenOnly = (req, res, next) => {
    authFireBaseClient.firestore().collection('scheduler_auth_tokens').where('token', '==', req.headers.token)
        .get()
        .then(snapshot => {
            if (snapshot.size > 0) {
                return next();
            } else {
                res.status(401).send('Unauthorized');
            }
        })
        .catch(error => {
            console.error(error);
        });
};

/**
 *  Route middleware to ensure user is authenticated.
 */
exports.authorizedOnly = (req, res, next) => {
    if (!req.user || !req.user.uid) {
        console.error('User not authenticated');
        res.status(403).send('Unauthorized');
    }
    next();
};

/**
 *  Route middleware to ensure user is admin only.
 */
exports.adminOnly = (req, res, next) => {
    if (!req.user || !req.user.uid) {
        console.error('User not authenticated');
        res.status(401).send('Unauthenticated');
    }

    authFireBaseClient.firestore().doc(`/users/${req.user.uid}`)
        .get()
        .then(u => {
            const user = u.data();
            if (user.roles && user.roles.admin) {
                return next();
            } else {
                console.error('Not an admin: ', req.user.uid);
                res.status(403).send('Unauthorized');
            }
        })
        .catch(error => {
            console.error(error);
        });
};
