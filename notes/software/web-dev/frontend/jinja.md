# Jinja

```
{% include "template.html" %}
{% include "template.html" with data=data%}
```

```
{% for item in items %}
    <li>{{item}}</li>
{% endfor %}

{% macro build_list(items) %}
<ul>
    {% for item in items %}
        <li>{{item}}</li>
    {% endfor %}
</ul>
{% endmacro %}

{{ build_list(items) }}
```
