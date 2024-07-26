# Templating

## Style

```
[style.attribute]="booleanName ? 'trueValue' : 'falseValue'"
[class.name]="booleanName ? 'trueValue' : 'falseValue'"
[ngClass]="{ 'className1': boolean }"
[ngStyle]="{ 'attribute': value }"
```

## Multiple ng-content

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
