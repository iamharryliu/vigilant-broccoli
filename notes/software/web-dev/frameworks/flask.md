# Flask

## Routes

```
@app.route('/something/<data>')
def fn_name(data):
    ...
```

## Jinja

### Conditional Statements

```
{% if boolean %}
    ...
{% else %}
    ...
{% endif %}
```

### For Loops

```
{% for item in items %}
    ...
{% else %}
    ...
{% endfor %}
```

```
{% include 'template.html' %}
```

```
layout.html
...
{% block BLOCK_NAME %}{% endblock %}
...

file_that_uses_layout.html
{% extends 'layout.html' %}
{% block BLOCK_NAME %} ... {% endblock %}
```
