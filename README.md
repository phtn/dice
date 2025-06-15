### Bet curl : url headers data : zsh

```zsh
#!/bin/bash


curl 'https://ap.blink.run/api/game/dice/bet' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'content-type: application/json' \
  -H 'dnt: 1' \
  -H 'origin: https://bet88.ph' \
  -H 'priority: u=1, i' \
  -H 'referer: https://bet88.ph/' \
  -H 'sec-ch-ua: "Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' \
  -H 'x-token: e6745c86-655e-47f5-a339-3f781e78a28d' \
  --data-raw '{"amount":"0.00","currency":"PHP","custom":{"targetNumber":50.5,"option":"OVER"},"auto":false}'

```

### Bet fetch request : payload and response : nodejs

```js
fetch("https://ap.blink.run/api/game/dice/bet", {
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "x-token": "e6745c86-655e-47f5-a339-3f781e78a28d",
    Referer: "https://bet88.ph/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
  body: '{"amount":"0.00","currency":"PHP","custom":{"targetNumber":50.5,"option":"OVER"},"auto":false}',
  method: "POST",
});
```

### Bet post request : payload and response

```js
const payload = {
  amount: "0.00",
  currency: "PHP",
  custom: { targetNumber: 50.5, option: "OVER" },
  auto: false,
};

const response = {
  roundId: 46743378,
  win: false,
  active: false,
  winAmount: "0.00",
  profit: "0.00",
  custom: { result: "46.70", winningChance: "49.50" },
};
```
