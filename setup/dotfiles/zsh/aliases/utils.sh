check_network() {
    local verbose=0
    if [ "$1" = "-v" ]; then
        verbose=1
    fi
    if ping -q -c 1 -W 3 8.8.8.8 > /dev/null 2>&1; then
        if [ $verbose -eq 1 ]; then
            echo "Successful network connection."
        fi
        return 0
    else
        if [ $verbose -eq 1 ]; then
            echo "Unsuccessful network connection."
        fi
        return 1
    fi
}

alias check_network_verbose='check_network -v'
