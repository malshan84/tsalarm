import { ManagerFactory } from "./Manager/ManagerFactory"
import { ManagerKind } from "./Manager/ManagerFactory"
import { IManager } from "./Manager/IManager";

import * as line from "@line/bot-sdk";
import * as express from "express";
import { JSONParseError, SignatureValidationFailed } from "../node_modules/@line/bot-sdk/lib/exceptions";

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

const app = express();

app.post('/webhook', line.middleware(config), (req: express.Request, res: express.Response) => {
    Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});


// event handler
function handleEvent(event : Line.MessageEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  const eventMessage : Line.TextEventMessage = event.message as Line.TextEventMessage;
  // create a echoing text message
  const echo : Line.TextMessage = { type: 'text', text: eventMessage.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port : string = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});


const kind : ManagerKind = ManagerKind.Alarm;
const managerFactory : ManagerFactory = ManagerFactory.getInstance();
const manager : IManager = managerFactory.createManager(kind);

