#!/bin/bash

DOCKER_CLEANUP_LOG="$HOME/.docker_cleanup.log"
DOCKER_CLEANUP_DAYS=7
SECONDS_PER_DAY=86400
IMAGE_AGE_HOURS=168

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$DOCKER_CLEANUP_LOG"
}

should_run_cleanup() {
    [ ! -f "$DOCKER_CLEANUP_LOG" ] && return 0

    local last_run=$(stat -f %m "$DOCKER_CLEANUP_LOG" 2>/dev/null)
    local current_time=$(date +%s)
    local days_since=$(((current_time - last_run) / SECONDS_PER_DAY))

    [ $days_since -ge $DOCKER_CLEANUP_DAYS ]
}

cleanup_docker() {
    command -v docker &> /dev/null || return 0
    docker info &> /dev/null || return 0
    should_run_cleanup || return 0

    log_message "Starting Docker cleanup"

    docker image prune -af --filter "until=${IMAGE_AGE_HOURS}h" &> /dev/null
    docker container prune -f &> /dev/null
    docker volume prune -f &> /dev/null
    docker network prune -f &> /dev/null

    log_message "Docker cleanup completed"
}

cleanup_docker
