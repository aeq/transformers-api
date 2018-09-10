# Transformers API
https://transformers-api.firebaseapp.com/

The web app uses a combination of Firebase Hosting and Cloud Functions to create a simple REST API that allows for CRUD functionality over Transformer objects.

# Local Development
1. Clone repo.
2. Run `npm install` in the root directory and `/functions` directory.
3. Run `npm install -g firebase-tools` in the terminal.
4. Ensure you have a Firebase account. 
5. Ensure you have created a Firebase project in that account.
6. Run `firebase login`
7. Download your service credentials which is in the form a JSON file (You can find the credentials by navigating to your newly created project in the [Firebase Console](https://console.firebase.google.com/)). Rename it to "service-account-credentials.json" and place the file in the `/functions` directory of the project.
8. Initialize a Realtime Database in the Firebase Console for your project and copy the generated database URL into the `index.js` file located in the `/functions` directory like so:
```
const credentials = require('./service-account-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: '<New Database URL>'
});
```
9. `cd` in to the root directory of the repo and run `firebase serve --only functions, hosting`
10. The app should now be hosted on localhost:5000.

# Deployment
1. To deploy changes to https://transformers-api.firebaseapp.com/ one would need the correct credentials for that project. Ask whomever is in charge of the account managing it to add your account as a member of the project. 
2. Follow step 6 of the Local Development instructions above. 
3. `cd` in to the root directory of the repo and run `firebase deploy` and follow the steps listed in the terminal, if any.
