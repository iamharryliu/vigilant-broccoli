import datetime
from django.db import models
from django.utils import timezone


class Mock(models.Model):
    name = models.CharField(max_length=200)
    date = models.DateTimeField("date published")

    def __str__(self):
        return self.name

    # Custom method
    def was_published_recently(self):
        return self.date >= timezone.now() - datetime.timedelta(days=1)


class MockChild(models.Model):
    name = models.CharField(max_length=200)
    parent = models.ForeignKey(Mock, on_delete=models.CASCADE)

    def __str__(self):
        return self.choice_text
