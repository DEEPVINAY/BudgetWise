# How to Set Up an Admin User

To gain full administrative access to all data in your Firestore database, you need to set a custom user claim on your Firebase account. This is a secure process that must be performed from a trusted server environment using the Firebase Admin SDK.

**You cannot do this from the browser.** You will need to set up a small Node.js script to perform this action.

## Prerequisites

1.  **Your User ID (UID)**:
    *   Navigate to your project in the [Firebase Console](https://console.firebase.google.com/u/0/project/_/authentication/users).
    *   In the left-hand menu, click on **Authentication**.
    *   On the **Users** tab, you'll see a table of all your registered users.
    *   Find the user you want to make an admin (e.g., `vparisarla@gmail.com`).
    *   In that user's row, find the **User UID** column and copy the value. It is a long alphanumeric string.

2.  **Node.js**: Ensure you have Node.js installed on your local machine.
3.  **Firebase Admin SDK**: You will install this in your script's directory.
4.  **Service Account Key**: You need a service account key from your Firebase project to authorize the Admin SDK.
    *   Go to your Firebase project settings, then "Service accounts".
    *   Click "Generate new private key" and save the downloaded JSON file securely. **Do not commit this file to version control.**

## Steps to Set the Admin Claim

1.  **Create a New Directory**: On your local machine, create a new folder (e.g., `set-admin-script`).

2.  **Save Your Service Account Key**: Place the downloaded service account JSON file inside this new directory. Rename it to `service-account-key.json` for simplicity.

3.  **Create a Script File**: Inside the same directory, create a file named `set-admin.js`.

4.  **Add the Script Content**: Open `set-admin.js` and paste **ONLY the JavaScript code below**.

    ---
    ***COPY THE CODE INSIDE THIS BOX***
    ```javascript
    const admin = require('firebase-admin');

    // ---- REPLACE THIS VALUE IF NEEDED ----
    const SERVICE_ACCOUNT_PATH = './service-account-key.json'; // Path to your service account file
    const USER_UID_TO_MAKE_ADMIN = 'jq3AEVNd2JQkWifRxrzVgwbk5fY2'; // The UID of the user to make an admin
    // ------------------------------------

    const serviceAccount = require(SERVICE_ACCOUNT_PATH);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    if (!USER_UID_TO_MAKE_ADMIN || USER_UID_TO_MAKE_ADMIN === 'YOUR_USER_ID_HERE') {
        console.error('Error: Please replace "YOUR_USER_ID_HERE" with the actual user UID in the script.');
        process.exit(1);
    }

    // Set the 'admin' custom claim
    admin.auth().setCustomUserClaims(USER_UID_TO_MAKE_ADMIN, { admin: true })
      .then(() => {
        console.log(`Successfully set 'admin' claim for user ${USER_UID_TO_MAKE_ADMIN}.`);
        console.log('The user will have admin access on their next sign-in or after their current token expires (up to 1 hour).');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Error setting custom user claims:', error);
        process.exit(1);
      });
    ```
    ***END OF CODE TO COPY***
    ---

5.  **Initialize npm and Install SDK**: Open a terminal in your new directory and run:

    ```bash
    npm init -y
    npm install firebase-admin
    ```

6.  **Run the Script**: In your terminal, run the script:

    ```bash
    node set-admin.js
    ```

7.  **Verification**: After the script runs successfully, the `admin` claim is set. For the change to take effect in the app, you must **sign out and sign back in** to refresh your authentication token.

You have now granted yourself full administrative access.