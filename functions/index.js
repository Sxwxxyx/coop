/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const line = require("./utils/line"); 
const gemini = require("./utils/gemini");


exports.webhook = onRequest(async (req, res) => {
  if (req.method === "POST") {
    const events = req.body.events;                                                                                   
    for (const event of events) {
      switch (event.type) {
        case "message":
          if (event.message.type === "text") {
            console.log(event.message.text);
            // const msg = await gemini.textOnly(event.message.text);
            // await line.reply(event.replyToken, [{ type: "text", text: msg }]);
            // return res.end();
            const msg = await gemini.chat(event.message.text);
            await line.reply(event.replyToken, [{ type: "text", text: msg }]);
            return res.end();
          }
          if (event.message.type === "image") {
            const imageBinary = await line.getImageBinary(event.message.id);
            const msg = await gemini.multimodal(imageBinary);
            await line.reply(event.replyToken, [{ type: "text", text: msg }]);
            return res.end();
          }
          break;
      }
    }
  }
  res.send(req.method);
});