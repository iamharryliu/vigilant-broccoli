# Employee Handler

## CLI Script Implementation

```
// script.ts
(async () => {
    try {
        await EmployeeHandlerService.handleInput(YOUR_EMPLOYEE_HANDLER_CONFIG);
    } catch (err) {
        console.error(err);
    } finally {
        console.log('Finally.')
    }
})();
```

```
npx tsx script.ts ACTION

// Onboard
npx tsx script.ts onboardIncomingEmployees

// Active Maintenance
npx tsx script.ts generateLocalSignatures
npx tsx script.ts updateEmailSignatures
npx tsx script.ts emailZippedSignatures

// Offboard
npx tsx script.ts offboardInactiveEmployees

// Post Retention
npx tsx script.ts postRetentionCleanup
```
