#!/bin/bash
if ! pgrep -f GuestAgentCorePlugin > /dev/null; then
    systemctl restart google-guest-agent-manager
fi
