# Online Services
# Google Services
alias gmail='chrome "https://gmail.com/"'
alias gphotos='chrome "https://photos.google.com/?pli=1"'
alias gcalendar='chrome "https://calendar.google.com/calendar/u/0/r"'
alias gstorage='chrome "https://one.google.com/storage/management"'
alias gdrive='chrome "https://drive.google.com/drive/u/0/my-drive"'
alias gmaps='chrome "https://www.google.com/maps"'
# Apple
alias findmy='chrome "https://www.icloud.com/find/"'
alias applestorage='chrome "https://www.icloud.com/storage/"'
# Storage
alias checkstorage='applestorage && gstorage'

# General Links
alias chrome='open -a "Google Chrome"'
alias google="~/shell-scripts/google_search.sh"
alias youtube="~/shell-scripts/youtube_search.sh"
alias chatgpt='chrome "https://chat.openai.com/"'
alias pinterest="~/shell-scripts/pinterest_search.sh"
alias gtranslate='chrome "https://translate.google.com/"'
# Utility
alias numi='open -a "Numi"'
# Consumerism
alias amazon="~/shell-scripts/amazon_search.sh"
alias karmanow='chrome "https://www.karmanow.com/my-items"'

# Message Services
alias igchat='chrome "https://www.instagram.com/direct/inbox/"'
alias fbmessenger="chrome 'https://www.messenger.com/'"
alias slackchat="chrome 'https://app.slack.com/client/'"

# Obsidian
alias openNotes="open 'obsidian://open?vault=notes'"
alias openJournal="open 'obsidian://open?vault=journal'"

# Learning
alias udemy='chrome "https://www.udemy.com/"'
alias memrise='chrome "https://app.memrise.com/dashboard"'
alias communitymemrise='chrome "https://community-courses.memrise.com/dashboard"'
alias udemyspanish='chrome "https://www.udemy.com/course/3-minute-spanish-course-5/learn"'
alias udemyfrench='chrome "https://www.udemy.com/course/3-minute-french-course-8/learn"'
alias languagepread='cdvb && code notes/language-learning/language-spread.md'
alias languagelearn="languagepread && gtranslate && communitymemrise && udemyspanish && udemyfrench && memrise"

# Career
alias openresume='chrome "https://docs.google.com/document/d/1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU/edit#heading=h.uzt44hq0695d"'
alias openlinkedin='chrome "https://www.linkedin.com/jobs/"'
alias jobhunt='openresume && openlinkedin'

# Finance
alias openTD='chrome "https://authentication.td.com/uap-ui/?consumer=easyweb&locale=en_CA#/uap/login"'
# Investment
alias questtrade='chrome "https://login.questrade.com/account/login"'
# Credit Accounts
alias openNeo='chrome "https://member.neofinancial.com/login"'
alias openMBNA='chrome "https://www.mbna.ca/en"'
alias OpenCTTriangle='chrome "https://www.ctfs.com/content/dash/en/public/login.html"'
alias openHomeDepot='chrome "https://citiretailservices.citibankonline.com/RSnextgen/svc/launch/index.action?siteId=CACN_HOMEDEPOT#signon"'
alias billpay='openTD && openNeo && openMBNA && OpenCTTriangle && openHomeDepot'
# Paid Services
alias freedomusage='chrome "https://myaccount.freedommobile.ca/usage"'
alias presto='chrome "https://www.prestocard.ca/en/account-dashboard"'
alias checkpaidservices='freedomusage && preso'
# Dev Billing
alias openFlyBilling='chrome "https://fly.io/dashboard/personal/billing"'
alias openOpenAIBilling='chrome "https://platform.openai.com/account/billing/overview"'
alias openAWSBilling='chrome "https://us-east-1.console.aws.amazon.com/costmanagement/home?region=us-east-1#/home"'
alias checkDevBilling='openFlyBilling && openOpenAIBilling && openAWSBilling'

# Toronto
# Toronto Alerts
alias torontoalerts='chrome "https://torontoalerts.com/"'
# Ice Skating
alias heronparkleisureskateschedule='chrome "https://www.toronto.ca/data/parks/prd/skating/dropin/leisure/index.html#loc_633"'
alias centennialskateschedule='chrome "https://www.toronto.ca/data/parks/prd/skating/dropin/leisure/index.html#loc_537"'
alias scarboroughvillageskateschedule='chrome "https://www.toronto.ca/data/parks/prd/skating/dropin/leisure/index.html#loc_743"'
alias checkskatingtimes='heronparkleisureskateschedule && centennialskateschedule && scarboroughvillageskateschedule'
