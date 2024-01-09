from datetime import datetime, timedelta, date
import pytz


def get_today():
    today = date.today()
    return datetime.combine(today, datetime.min.time()).replace(tzinfo=pytz.utc)


def get_tomorrow():
    return get_today() + timedelta(days=1)


def get_one_week_from_dt(dt):
    return dt + timedelta(days=7)


def get_monday_this_week_dt():
    today = get_today()
    return today - timedelta(today.weekday())


def get_monday_of_this_week():
    monday_dt = get_monday_this_week_dt()
    monday_of_this_week = (
        datetime.combine(monday_dt, datetime.min.time()).isoformat() + "Z"
    )  # 'Z' indicates UTC time
    return monday_of_this_week


def getStartOfWeekX(week):
    today = get_today()
    return today - timedelta(days=today.weekday()) + timedelta(weeks=week - 1)


def getEndOfWeekX(week):
    return getStartOfWeekX(week) + timedelta(days=7)


class Task:
    def __init__(self, color, start=0, end=0):
        self.start = start
        self.end = end
        self.color = color

    @property
    def total_time(self):
        return self.get_total_time()

    def get_total_time(self):
        time_difference = self.end - self.start
        seconds = time_difference.total_seconds()
        hours = seconds / 3600
        return hours

    def __repr__(self):
        return f"{self.color} / {self.start} / {self.end} / {self.total_time}"


HEXCODE_TO_COLOR_DICT = {
    "#a4bdfc": "LAVENDER",
    "#7ae7bf": "SAGE",
    "#dbadff": "GRAPE",
    "#ff887c": "FLAMINGO",
    "#fbd75b": "BANANA",
    "#ffb878": "TANGERINE",
    "#46d6db": "PEACOCK",
    "#e1e1e1": "GRAPHITE",
    "#5484ed": "BLUEBERRY",
    "#51b749": "BASIL",
    "#dc2127": "TOMATO",
}

COLOR_ID_TO_COLOR_DICT = {
    "1": "LAVENDER",
    "2": "SAGE",
    "3": "GRAPE",
    "4": "FLAMINGO",
    "5": "BANANA",
    "6": "TANGERINE",
    "7": "PEACOCK",
    "8": "GRAPHITE",
    "9": "BLUEBERRY",
    "10": "BASIL",
    "11": "TOMATO",
}
