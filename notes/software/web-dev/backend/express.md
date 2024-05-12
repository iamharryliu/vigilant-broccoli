# Express

## CORS

```
const CORS_OPTIONS = { origin: true, credentials: true };
const ALLOWED_ORIGINS = ['https://harryliu.design/', 'https://torontoalerts.com/']
const CORS_OPTIONS = {
    origin: ALLOWED_ORIGINS, credentials: true };
app.use(cors(CORS_OPTIONS));
```

## References

[CORS](https://expressjs.com/en/resources/middleware/cors.html)

[Express](https://reflectoring.io/getting-started-with-express/)

[Google Recaptcha V3 Verify](https://developers.google.com/recaptcha/docs/verify)

[Jest Testing](https://dev.to/nathan_sheryak/how-to-test-a-typescript-express-api-with-jest-for-dummies-like-me-4epd)
