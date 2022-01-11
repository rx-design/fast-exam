## Fast Exam - Learn and study material in the modern way!
Serverless cloud-based cross-platform LMS (MVP).

Core features:
- Import and manage courses
- Assess and test knowledge
- Review and export results

LMS (learning management system) is based on multiplayer quiz game.

### Game description

- Answer questions and get points for the correct answers.
- Get 5 points faster than your opponent to win the game.

### Demo
https://fast-exam.web.app/

### Tech stack
- TypeScript
- Vue (frontend)
- Firebase (backend)
- Bulma (design)

### Delete users
```
exports.deleteUsers = functions.https.onRequest(async (req, resp) => {
  await admin.auth().listUsers()
    .then(r => admin.auth().deleteUsers(r.users.map(u => u.uid)));
  
  resp.send('Users have been successfully deleted.');
});

firebase deploy --only functions:deleteUsers
firebase functions:delete deleteUsers
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
