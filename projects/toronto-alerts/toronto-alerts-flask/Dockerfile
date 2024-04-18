# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.12.2

FROM python:${PYTHON_VERSION}-slim

LABEL fly_launch_runtime="flask"

WORKDIR /code

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
EXPOSE 8080

# CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=8080", "--debug"]

RUN apt-get update
RUN apt-get install -y cron
COPY etc/crontab /app/etc/crontab

COPY run.sh /app/run.sh
RUN ["chmod", "+x", "/app/run.sh"]
CMD /app/run.sh
