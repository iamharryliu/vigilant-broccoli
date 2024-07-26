# Angular

Angular is a full fledged, opinionated, frontend framework that has features out of the box features to get started.

## Commands

Angular CLI

```
# Install
npm install -g @angular/cli
npm install -g @angular/cli@latest

ng version
ng update

ng new [appname]
ng g component|directive|pipe|service|class|guard|interface|enum|module

npm i && ng serve
```

## View Encapsulation

There are 3 view encapsulation modes for Angular, Emulate, None, and ShadowDOM.

### Emulated(default)

- CSS generated inside of head tag of web application.

### None

- Styles are not encapsulated making it effectively global styling.
- This style can affect elements outside the component and should be used in cases where you don't care about styling encapsulation.

### ShadowDom

- Strongest form of encapsulation.
- Useful for building reusable components where strict style encapsulation is necessary.
- Not supported by some legacy browsers
- CSS generated inside of DOM.

## References

[Recaptcha](https://dev.to/rodrigokamada/adding-the-google-recaptcha-v3-to-an-angular-application-kge)

[ngx-translate](https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-angular-app-with-ngx-translate)

[ngx-translate on startup](https://mcvendrell.medium.com/configuring-ngx-translate-to-load-at-startup-in-angular-1995e7dd6fcc)

[exhaustMap to prevent additional user click](https://stackoverflow.com/questions/63780853/prevent-user-to-click-button-until-service-response-angular-7-rxjs)
