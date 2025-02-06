handleInput(config, command)

Config

Commands

- onboardIncomingEmployees
  - fetchIncomingUserData
  - processUserOnboarding
- applyEmailSignatureUpdates
  - fetchEmailSignatures: emailSignatures
  - processEmailSignatureUpdates
- offboardInactiveEmployees
  - fetchInactiveEmployees
  - processUserOffboarding
- handlePostRetention
  - fetchPostRetentionData
  - processPostRetentionData

npm uninstall @vigilant-broccoli/employee-handler && npm install /Users/harryliu/vigilant-broccoli/projects/nx-workspace/dist/libs/@vigilant-broccoli/employee-handler

nx run-many -t=build --skip-nx-cache
