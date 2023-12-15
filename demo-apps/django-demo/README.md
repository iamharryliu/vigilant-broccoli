# Django Demo

# Commands

```
python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
python manage.py runserver [port number]
python manage.py runserver [ip address]:[port number]

python manage.py startapp [app name]


python manage.py makemigrations [model name]
python manage.py sqlmigrate [model name] 0001
python manage.py check
python manage.py migrate

python manage.py shell


```

```
from app.models import Model
Model.objects.all()
Model.objects.filter(id=1)
Model.objects.get(pub_date__year=current_year)
```
