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
```

## Employee Handler Actions

- **Onboard**
  - `onboardIncomingEmployees`
- **Active Maintenance**
  - `generateLocalSignatures`
  - `updateEmailSignatures`
  - `emailZippedSignatures`
- **Offboard**
  - `offboardInactiveEmployees`
- **Post Retention**
  - `handlePostRetention`
