check_network() {
    # Attempt to ping Google's public DNS server (8.8.8.8) with a timeout of 3 seconds
    if ping -q -c 1 -W 3 8.8.8.8 > /dev/null 2>&1; then
        return 0  # Internet connection is available
    else
        return 1  # No internet connection
    fi
}
