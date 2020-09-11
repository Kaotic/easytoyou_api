# EasyToYou.eu Headless Chrome API

Simple [EasyToYou.eu](https://easytoyou.eu/) API using [Puppeteer (Headless Chrome Node.js API)](https://github.com/puppeteer/puppeteer) for decrypting directory from your computer.

## Installation :

Use [NodeJS](https://nodejs.org/) v12.4.0 with npm.

```bash
npm install
```

## Configuration :

##### In ```config.json``` you need to change :
- ```directoryToDecrypt``` : Your encrypted directory
- ```EasyToYou_Method``` : Method for decrypting (```ic7php52``` ```ic7php53``` ```ic8php52``` ```ic8php53``` ```ic10php53``` ```ic10php54``` ```ic10php55``` ```ic10php56``` ```ic10php56v2```)
- ```EasyToYou_Cookies``` : Use [EditThisCookie](https://github.com/ETCExtensions/Edit-This-Cookie) (Chrome; Firefox; Opera; Etc..) for export cookies from [EasyToYou.eu](https://easytoyou.eu/)

##### Example of cookie export (```EasyToYou_Cookies```) :
```json
[
    {
      "domain": ".easytoyou.eu",
      "hostOnly": false,
      "httpOnly": true,
      "name": "__cfduid",
      "path": "/",
      "sameSite": "lax",
      "secure": true,
      "session": false,
      "storeId": "0",
      "value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "id": 1
    },
    {
      "domain": "easytoyou.eu",
      "hostOnly": true,
      "httpOnly": false,
      "name": "PHPSESSID",
      "path": "/",
      "sameSite": "unspecified",
      "secure": false,
      "session": true,
      "storeId": "0",
      "value": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
      "id": 2
    }
  ]
```

## Usage :

```bash
npm run decrypt
```

## Contributing :
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License :
[MIT License](https://opensource.org/licenses/MIT)