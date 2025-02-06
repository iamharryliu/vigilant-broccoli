# Employee Handler

```
// demo.ts
(async () => {
    try {
        await EmployeeHandlerService.handleInput(DEMO_CONFIG, 'ACTION');
    } catch (err) {
        console.error(err);
    }
})();
```

**EmployeeHandler Actions**

- `onboardIncomingEmployees`
- `applyEmailSignatureUpdates`
- `offboardInactiveEmployees`
- `handlePostRetention`
