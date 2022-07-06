# apeiner-bot

> Telegram chatbot for sending alerts about trending NFT collections

## Getting started

### Prerequisites

- Node version 18

### Setup

```bash
git clone git@github.com:zsevic/apeiner-bot.git
cd apeiner-bot
cp .env.sample .env # change values after copying
npm i
npm run start:dev
npm run telegram-webhook:set
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

- Node.js, Bottender

## Chatbot setup

```bash
npx bottender telegram webhook set -w https://lionfish-app-rgbxa.ondigitalocean.app/webhooks/telegram
```
