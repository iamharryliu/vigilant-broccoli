# JWT

```
const jwt = require('jsonwebtoken');

// Generatred on authorization requests to be sent back to the client in the response.
function generateToken(user) {
    const token = jwt.sign(user.id, secretKey, { expiresIn: '1h' });
    return token;
}

// Used by middleware on serverside to verify request from clientside.
function verifyToken(token) {
    try {
        const userId = jwt.verify(token, secretKey);
        return userId;
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}
```

## References

[JWT Auth in Express App](https://dvmhn07.medium.com/jwt-authentication-in-node-js-a-practical-guide-c8ab1b432a49)
