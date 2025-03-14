
# Browser
alias chrome='open -a "Google Chrome"'
alias firefox='open -a "Firefox"'
alias chromeExtensions='chrome "chrome://extensions/"'


# Utility
alias google="~/shell-scripts/google_search.sh"
alias gmaps='chrome "https://www.google.com/maps"'
alias chatgpt='function _gptquery() { local query=$(echo "$*" | sed "s/ /%20/g"); open "https://chatgpt.com/?q=${query}"; }; _gptquery'
alias claude='open https://claude.ai'
alias youtube="~/shell-scripts/youtube_search.sh"
alias gtranslate='chrome "https://translate.google.com/"'
alias pinterest="~/shell-scripts/pinterest_search.sh"
alias amazon="~/shell-scripts/amazon_search.sh"
alias karmanow='chrome "https://www.karmanow.com/my-items"'
alias numi='open -a "Numi"'
alias openspeedtest="chrome 'https://www.speedtest.net/'"
alias pwgen="chrome 'https://passwordsgenerator.net/'"
alias obsidian="open -a 'Obsidian'"
alias qrgen="chrome 'https://www.qr-code-generator.com/'"
alias tinyurl="chrome 'https://tinyurl.com/'"

# Services
alias gmail='chrome "https://gmail.com/"'
alias gcalendar='chrome "https://calendar.google.com/"'
alias gmeet='chrome "https://meet.google.com/"'
alias gdrive='chrome "https://drive.google.com/drive/u/0/my-drive"'
alias gcontacts='chrome "https://contacts.google.com/"'
alias findmy='chrome "https://www.icloud.com/find/"'
alias gphotos='chrome "https://photos.google.com/?pli=1"'
alias gstorage='chrome "https://one.google.com/storage/management"'
alias applestorage='chrome "https://www.icloud.com/storage/"'
alias checkstorage='applestorage && gstorage'

# Communication
alias openMessages="open -a 'Messages'"
alias igMessenger='chrome "https://www.instagram.com/direct/inbox/"'
alias fbMessenger="chrome 'https://www.messenger.com/'"
alias openWhatsApp="open -a 'WhatsApp'"
alias openSlack="open -a 'Slack'"
alias openSlackBrowser="chrome 'https://app.slack.com/client/'"

# Learning
alias udemy='chrome "https://www.udemy.com/"'
alias memrise='chrome "https://app.memrise.com/dashboard"'
alias communitymemrise='chrome "https://community-courses.memrise.com/dashboard"'
alias udemyspanish='chrome "https://www.udemy.com/course/3-minute-spanish-course-5/learn"'
alias udemyfrench='chrome "https://www.udemy.com/course/3-minute-french-course-8/learn"'
alias languagespread="code $LANGUAGE_LEARNING_DIR/language-spread/language-spread.md"
alias languagelearn="languagepread && gtranslate && communitymemrise && udemyspanish && udemyfrench && memrise"

# Career
alias openresume='chrome "https://docs.google.com/document/d/1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU/edit#heading=h.uzt44hq0695d"'
alias openlinkedin='chrome "https://www.linkedin.com/jobs/"'
alias jobhunt='openresume && openlinkedin'

# Toronto
# Toronto Alerts
alias torontoalerts='chrome "https://torontoalerts.com/"'
# Ice Skating
alias heronparkleisureskateschedule='chrome "https://www.toronto.ca/data/parks/prd/skating/dropin/leisure/index.html#loc_633"'
alias centennialskateschedule='chrome "https://www.toronto.ca/data/parks/prd/skating/dropin/leisure/index.html#loc_537"'
alias scarboroughvillageskateschedule='chrome "https://www.toronto.ca/data/parks/prd/skating/dropin/leisure/index.html#loc_743"'
alias checkskatingtimes='heronparkleisureskateschedule && centennialskateschedule && scarboroughvillageskateschedule'
