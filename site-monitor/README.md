# Site Monitor
Python script to monitor servers and restart Linode servers if they are down.

### Requirements
* Python3.6+
* pip3
* Google App Password: https://myaccount.google.com/apppasswords

### Installing

Setup configuration file for email services and your linode token. Make sure to use bash setting file (~/.bashrc or ~/.bash_profile) to initialize these variables.
```
sudo nano ~/.bash_config
```
```
{
        "EMAIL_USERNAME":"email",
        "EMAIL_PASSWORD":"google app password",
        "LINODE_TOKEN":"token"
}
```
```
cd ~
git clone https://github.com/itzliu/site-monitor.git
cd site-monitor
python3 -m venv venv
source venv/bin/activate
pip install requests
pip install linode_api4
python run.py
```

To automate this script to check your websites periodically you can do the following.

Copy Python environment path
```
which python
```
Open Cron job.
```
crontab -e
```
Add cron job.
```
*/10 * * * * . [bash file that that will initialize ~/.bash_config variables] && [python path] [run.py path]
```
