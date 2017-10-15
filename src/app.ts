import { ManagerFactory } from "./Manager/ManagerFactory"
import { ManagerKind } from "./Manager/ManagerFactory"
import { IManager } from "./Manager/IManager";
import {ResultMessage} from "./Manager/ResultMessage"
import * as line from "@line/bot-sdk";
import * as express from "express";
import * as info from "./Line/info";
import * as LineUtil from "./Line/LineUtil";
import { JSONParseError, SignatureValidationFailed } from "../node_modules/@line/bot-sdk/lib/exceptions";

import bodyParser = require('body-parser');

const config = {
    channelAccessToken: info.CHANNEL_ACCESS_TOKEN,
    channelSecret: info.CHANNEL_SECRET
};

const client : line.Client = new line.Client(config);

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req: express.Request, res: express.Response) => {
	console.log('[GET]/');
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.end('<h1><a href="http://8ctci.weebly.com">Hello, I\'m the Master of Time!</a><h1>');
});

// app.get('/webhook', (req: express.Request, res: express.Response) => {
// 	console.log('[GET]/');
// 	res.writeHead(200, {'Content-Type' : 'text/html'});
// 	res.end('<h1><a href="http://8ctci.weebly.com">Hello, I\'m the Master of Time!</a><h1>');
// });

app.post('/webhook', line.middleware(config), (req: express.Request, res: express.Response) => {
    Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
    
    res.sendStatus(200);
});

// event handler
function handleEvent(event : Line.MessageEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  const text: string = event.message.text;
	console.log('======================', new Date() ,'======================');
	console.log('[request source] ', event.source);
	console.log('[request message]', event.message);
	console.log('[request text]', text);
  
  // 1) 어떤 매니저를 사용할 지 확인
  const manager : IManager = managerFactory.createManager(managerFactory.getKind(text));

  let id : string = LineUtil.getSourceId(event.source);
  // 2) 해당 매니저로 쿼리 수행
  let resultMessage : ResultMessage = manager.setId(id).run(text);

  const replyTextMessage : Line.TextMessage = { type: 'text', text: resultMessage.getMessage() };

  // use reply API
  return client.replyMessage(event.replyToken, replyTextMessage);
}

// listen on port
const port : string = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

const managerFactory : ManagerFactory = ManagerFactory.getInstance();

export = app;