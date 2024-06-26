# Angular

## Commands

Angular CLI

```
# Install
npm install -g @angular/cli
npm install -g @angular/cli@latest

ng version
ng update

ng new [appname]
ng g component|directive|pipe|service|class|guard|interface|enum|module`

npm i && ng serve
```

## Templating

### Style

```
[style.attribute]="booleanName ? 'trueValue' : 'falseValue'"
[class.name]="booleanName ? 'trueValue' : 'falseValue'"
[ngClass]="{ 'className1': boolean }"
[ngStyle]="{ 'attribute': value }"
```

### Multiple ng-content

```
<app-child>
    <div header >This should be rendered in header selection of ng-content</div>
    <div body >This should be rendered in body selection of ng-content</div>
</app-child>
```

```
<div class="header-css-class">
    <ng-content select="[header]"></ng-content>
</div>
<div class="body-css-class">
    <ng-content select="[body]"></ng-content>
</div>
```

## References

[Recaptcha](https://dev.to/rodrigokamada/adding-the-google-recaptcha-v3-to-an-angular-application-kge)

[ngx-translate](https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-angular-app-with-ngx-translate)

[ngx-translate on startup](https://mcvendrell.medium.com/configuring-ngx-translate-to-load-at-startup-in-angular-1995e7dd6fcc)

[exhaustMap to prevent additional user click](https://stackoverflow.com/questions/63780853/prevent-user-to-click-button-until-service-response-angular-7-rxjs)
