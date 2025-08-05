# vigilant-broccoli

## About

vigilant-broccoli, my personal software toolkit.

<div>
<img src="https://i.pinimg.com/564x/b7/62/38/b762386c0bbb20dec77c2632f73d28a8.jpg" alt="broccoli" width="200"/>
</div>

## Machine Setup

### Macbook Pro (MBP)

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git

# Clone using HTTP.
cd ~ && git clone https://github.com/iamharryliu/vigilant-broccoli.git

# Clone repo using SSH key.
# Setup SSH key.
ssh-keygen -b 4096 -t rsa
cat ~/.ssh/id_rsa.pub| pbcopy
open 'https://github.com/settings/keys'
# Clone repo.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git

# Run install script.
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
source ~/vigilant-broccoli/setup/mac/install.sh
```

**Additional Preferences**

- Divvy Shortcut `CMD + Shift + Spacebar`
- Alfred Spotlight Shortcut `CMD + Spacebar`
- Desktop Icons

## Folder Structure

- notes - Collection of markdown notes.
- projects - Software projects.
  - Nx workspace for Typescript projects
  - Demo/Sandbox Applications
  - Leetcode Solutions
  - Other Projects
- scripts - Software scripts.
- setup - Setup scripts and configurations.
- snippets - Text and code snippets for quick copy and paste.

# Stack

- **Applications**
  - Monorepo Tooling - [Nx](https://nx.dev/)
  - Message Broker - [RabbitMQ](https://www.rabbitmq.com/docs)
  - Socket Service - [SocketIO](https://socket.io/docs/)
  - Frameworks
    - UI
    - [Next.js](https://nextjs.org/docs/)
    - [React](https://react.dev/)
    - [Angular](https://angular.dev/)
  - Backend Frameworks
    - [Express](https://expressjs.com/)
    - [Flask](https://flask.palletsprojects.com/en/stable/)
- **Database**
  - SQL
    - [PostgreSQL](https://www.postgresql.org/docs/)
    - [SQLite](https://www.sqlite.org/docs.html)
- **Utility**
  - [OpenAI](https://platform.openai.com/docs/overview)
    - Basic prompting
    - Image analysis
    - Image generation
  - [Twilio](https://www.twilio.com/docs)
  - [OpenWeather](https://openweathermap.org/api)
  - Productivity
    - Email - [Gmail](https://mail.google.com/)
    - Calendar - [Google Calendar](https://calendar.google.com/)
- **Version Control** - [Git](https://github.com/)
- **CICD**
  - [Github Actions](https://github.com/features/actions)
    - Deployments
    - Health Checks
    - Cleanups
- **DNS Management** - [Cloudflare](https://www.cloudflare.com/application-services/products/dns/)
- **Analytics** - [Google Analytics](https://analytics.google.com/analytics)
- **Security**
  - [Google Recaptcha](https://developers.google.com/recaptcha)
  - [Cloudflare Turnstile](https://www.cloudflare.com/application-services/products/turnstile/)
- **Cloud Services**
  - [Google Cloud](https://cloud.google.com/docs)
- **Storage**
  - [Google Drive](https://drive.google.com/)
  - [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)
- **Deployment**
  - [Cloudflare Pages](https://pages.cloudflare.com/)
  - [FlyIO](https://fly.io/docs/)
  - [Vercel](https://vercel.com/templates/documentation)
  - Secret Management - [Hashicorp Vault](https://developer.hashicorp.com/vault/docs)
- **Serverless Functions**
  - Edge Functions
    - [Cloudflare Workers](https://workers.cloudflare.com/)
