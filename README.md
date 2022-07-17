# apeiner-bot

> Telegram chatbot for sending stats about trending NFT collections

## Getting started

### Prerequisites

- Node version 17

### Setup

```bash
git clone git@github.com:zsevic/apeiner-bot.git
cd apeiner-bot
cp .env.sample .env # change values after copying
nvm use 17
npm i
npm run dev
npx ngrok http 5000
npm run telegram-webhook:set <URL>/webhooks/telegram
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Testing

```bash
npm test
```

### Technologies used

- Node.js, Express, Cron, Bottender
