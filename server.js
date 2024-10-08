//THings to do:
// 1. I need to fix the landing animation for when i drop a photo in.
// finished - 2. I should have a loading state, a loading animation while waiting for the data, CSS is fast

//3. look up nullish coalessing
//4.look upoptional chaining

//5. I want to figure out a way to get every image on screen to see whats coming back!

//6. Put an the images in an icon and then have a "more" tab for more info, that expands the image and the text. That way more can be seen at once.
//7. find out how to do different things with data, and async. Because waiting for everything is slowing down my app plus i want differnt things to happen
// and the way the app is structered is slowing me down

//8. I need to implement javascript pupeeteer mode to move the CSV file to bookScouter

//9. a really cool feature would be if all the text that was on the sreen on the iphone as the user went to take a photo popped up on the mobile phone
// as the OCR started to identify the text on the book

//10. learn the basics of websockets on a seperate little practice page or app

//11. I need to get the websocket concept understood because my app brings back all the infomation if the user can click for more info
import dotenv from "dotenv";
dotenv.config();
console.log("testing the env", process.env.PRIVATE_KEY);
import OpenAI from "openai";

import { spawn } from "child_process";

import { exec } from "child_process";
import express from "express";
import axios from "axios";
import multer from "multer";
import detectSingleBookRouter from "./endPoints/singleBookEndPoint.js";

import { ImageAnnotatorClient } from "@google-cloud/vision";

// console.log(process.env.CHAT_GPT_API_KEY);
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

// import { apiKeys } from "./config/env.config";
import googleOcrObject from "./config/env.config.js";

// console.log("this is the api imports", googleOcrObject);

import { type } from "os";

// const CHAT_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// const chatGPTApiKey = process.env.CHAT_GPT_API_KEY;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// const credentials = {
//   type: googleOcrObject.type,
//   project_id: googleOcrObject.project_id,
//   private_key_id: googleOcrObject.private_key_id,
//   private_key: googleOcrObject.private_key,
//   client_email: googleOcrObject,
//   client_id: googleOcrObject.client_id,
//   auth_uri: googleOcrObject.auth_uri,
//   token_uri: googleOcrObject.token_uri,
//   auth_provider_x509_cert_url: googleOcrObject.auth_provider_x509_cert_url,
//   client_x509_cert_url: googleOcrObject.client_x509_cert_url,
//   universe_domain: googleOcrObject.universe_domain,
// };

const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

console.dir(credentials);
// console.log("this is the google credentials object", credentials);
const client = new ImageAnnotatorClient({ credentials: credentials });

const baseURL = "https://www.googleapis.com";

const apiKEYGoogleBooks = "AIzaSyC0VxffVwhh-iT2mTauuIoFoIwMgx20hUU";

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 4009;

app.use("/", detectSingleBookRouter);

//fetch(url: URL | RequestInfo, init?: RequestInit): Promise<Response>;

///   The function below returns the response from chatGPT
let bookNumber;
let totalBookCount = 0;
async function getBooksFromChatGPT(ocrText) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Please parse the following text from googles OCR of an image of books. There are ${bookNumber} books in the photo.  You are
        an API and your response is going to another API so you must be very exact about the format that you return the json string. Return
        this exact format - which means excluding ANY explanatory text, I repeat, no text other than the formatted numbers in JSON! -    {
          "isbn": “NUMBER”,
          "isbn13: “NUMBER”
        },
        {
         "isbn": “NUMBER”,
          "isbn13: “NUMBER”
          
        },  - The following is the text that needs parsing: ${ocrText}`,
      },
    ],
    stream: true,
  });
  let responseContent = "";
  for await (const part of stream) {
    responseContent += part.choices[0]?.delta?.content || "";
  }
  // console.log(
  //   "this is chatgpt respnse",
  //   responseContent,
  //   "this is the end of the response content"
  // );
  // console.log("this is the response content", responseContent);
  return responseContent;
}

//This is my main function right now.
let apiCounter = 0;
let userDescriptionRequirements = "";

app.post("/detectLabels", upload.array("images[]"), async (req, res) => {
  const bookTitleArray = [];
  userDescriptionRequirements = req.body.userInput;
  console.log(
    "this is the user description requirements",
    userDescriptionRequirements
  );

  apiCounter++;
  console.log("this is the api counter", apiCounter);

  console.log("this is the request file", req.file);
  if (!req.files) {
    console.log("No image provided.");
    return res.status(400).send("No image uploaded.");
  }
  // console.log("Image received. Proceeding with label detection.");
  // let booksrunData = await axios.get(
  //   `${baseBooksRunURL}${9781138790988}?key=${booksRunApiKey}`
  // );
  // console.log(
  //   "this is my isbn test for booksrunData textbook",
  //   booksrunData.data.result.text
  // );
  try {
    // Path to the photo at the root
    //  let textBackFromGoolgesOCR = "";
    for (let image of req.files) {
      const bookCountAccordingToCHATGPT = await getBooksCountFromChatGPT(
        image.buffer
      );
      console.log(
        "this is the book count from chatGPTs API",
        bookCountAccordingToCHATGPT
      );
      console.log(
        "this is the extracted book content",
        bookCountAccordingToCHATGPT.message.content
      );
      // const bookCount = JSON.parse(bookCountAccordingToCHATGPT.message.content);
      function extractBookCount(response) {
        const content = response.message.content;
        const match = content.match(/Books:\s*(\d+)/); // Regex to find 'Books:' followed by any number of digits
        return match ? parseInt(match[1], 10) : null; // Return the number or null if not found
      }
      bookNumber = extractBookCount(bookCountAccordingToCHATGPT);
      totalBookCount += bookNumber;
      console.log("this is the total book count", totalBookCount);
      console.log("this is the book number", bookNumber);
      // console.log("this is the book count parsed", bookCount);
      const buffer = image.buffer;
      console.log("this is the buffer from the array ", buffer);

      const [result] = await client.textDetection(buffer);
      const [resultFromOBjectDection] = await client.labelDetection(buffer);
      const objects = resultFromOBjectDection.labelAnnotations;
      console.log("this is the object detection annotations", objects);

      console.log(
        "this is the object detection result",
        resultFromOBjectDection
      );
      // console.log(
      // console.log(result, "this is the result from google vision");
      //   "THIS IS OCR RESULT OCR",
      //   result.textAnnotations[0].description
      // );
      console.log(
        "this is the text back from google vision from the new array ",
        result.textAnnotations[0].description
      );
      const textBackFromGoolgesOCR = result.textAnnotations[0].description;

      //This is the text block back from googles OCR
      // const textBackFromGoolgesOCR = result.textAnnotations[0].description;

      // chatGPT's parsing response
      console.log(
        "this is the text back from google vision from the array",
        textBackFromGoolgesOCR
      );

      // const filteredForNumbersOCR = extractLinesWithNumbers(
      //   textBackFromGoolgesOCR
      // );
      // console.log("this is the filtered for numbers OCR", filteredForNumbersOCR);

      const chatGPTResponse = await getBooksFromChatGPT(textBackFromGoolgesOCR);

      // console.log("chatGPT response", chatGPTResponse);

      let parsedGPTresponse;

      try {
        parsedGPTresponse = JSON.parse(chatGPTResponse);
      } catch (error) {
        console.error("this piece of shit parser for GPT isnt working", error);
        res.status(500).send("error processing line");
        return;
      }

      // Assuming parsedGPTresponse is an array of objects where each object has a 'title' property.
      console.log("parsedGPt", parsedGPTresponse);

      // if (Array.isArray(parsedGPTresponse) && )??
      let isbn;

      if (parsedGPTresponse.length > 0) {
        for (let isbnObject of parsedGPTresponse) {
          console.log("entering forloop for isbns");
          if (isbnObject.isbn13 || isbnObject.isbn) {
            if (isbnObject.isbn13 && isbnObject.isbn13.length === 13) {
              isbn = isbnObject.isbn13;
            } else {
              isbn = isbnObject.isbn;
            }
            console.log(isbnObject.isbn13);
            const constructedURL = `${baseURL}/books/v1/volumes?q=isbn:${encodeURIComponent(
              isbn
            )}&key=${apiKEYGoogleBooks}`;

            try {
              const googleBooksResponse = await axios.get(constructedURL);

              console.log(
                "this should be the title",
                googleBooksResponse.data?.items?.[0]?.volumeInfo?.title
              );

              let title =
                googleBooksResponse.data?.items?.[0]?.volumeInfo?.title;
              bookTitleArray.push(title);
              if (title === undefined && isbn === isbnObject.isbn13) {
                isbn = isbnObject.isbn;
                const constructedURL = `${baseURL}/books/v1/volumes?q=isbn:${encodeURIComponent(
                  isbn
                )}&key=${apiKEYGoogleBooks}`;
                try {
                  const googleBooksResponse = await axios.get(constructedURL);

                  console.log(
                    "this should be the title from the second fetch of the isbn, becuase the isbn 13 was undefined, its now trying the isbn 10",
                    googleBooksResponse.data?.items?.[0]?.volumeInfo?.title
                  );

                  let title =
                    googleBooksResponse.data?.items?.[0]?.volumeInfo?.title;
                  bookTitleArray.push(title);
                } catch (error) {
                  console.error(
                    "Error fetching from Google Books API with the new object that only has:",
                    error
                  );
                  res.status(500).send("Error fetching book data");
                  return;
                }
              }
            } catch (error) {
              console.error(
                "Error fetching from Google Books API with the new object that only has:",
                error
              );
              res.status(500).send("Error fetching book data");
              return;
            }
          }
        }
      } else {
        console.log("entering forloop for isbns");
        if (parsedGPTresponse.isbn13 || parsedGPTresponse.isbn) {
          if (parsedGPTresponse.isbn13) {
            isbn = parsedGPTresponse.isbn13;
          } else {
            isbn = parsedGPTresponse.isbn;
          }
          console.log(parsedGPTresponse.isbn13);
          const constructedURL = `${baseURL}/books/v1/volumes?q=isbn:${encodeURIComponent(
            isbn
          )}&key=${apiKEYGoogleBooks}`;

          try {
            const googleBooksResponse = await axios.get(constructedURL);

            console.log(
              "this should be the title from the chatGPT object not the array ",
              googleBooksResponse.data?.items?.[0]?.volumeInfo?.title
            );

            let title = googleBooksResponse.data?.items?.[0]?.volumeInfo?.title;
            bookTitleArray.push(title);
          } catch (error) {
            console.error(
              "Error fetching from Google Books API with the new object that only has:",
              error
            );
            res.status(500).send("Error fetching book data");
            return;
          }
        }
      }
    }

    console.log("this is the book title array", bookTitleArray);

    const descriptionAndNumberedTitles =
      await giveTitlesToChatGPTAndGetBackADescriptionAndOrderedTitles(
        bookTitleArray
      );
    console.log(
      "this is the description and numbered titles",
      descriptionAndNumberedTitles
    );

    res.json({
      message: "Image processed successfully",
      result: descriptionAndNumberedTitles,
      // bookUrls: totalArrayOfImages,
      // mappedImageAndSummary: mappedBookToImageAndSummary,
      // pricePlaceHolder: { Average: 0, Good: 0, New: 0 },
      // arrayOfISBNs: finalArryOfSetISBNS,
    });
  } catch (error) {
    console.error(
      "Error processing line at the end of the app:",
      error.message
    );

    res.status(500).send("Error processing the image.");
  }
});

let storedFile; // This variable will hold the most recent file data

app.post("/setMostRecentFile", (req, res) => {
  storedFile = req.body.file;
  // console.log("this is the stored file", storedFile);
  res.send(
    "File received from puppeteer containing book scouter prices and data"
  );
});

app
  .listen(port, () => {
    console.log(`server is running on port ${port}, so quit your whining `);
  })
  .on("error", (err) => {
    console.error("Error starting the server:", err);
  });

let userDescriptionRequirementsAddendum = "";
async function giveTitlesToChatGPTAndGetBackADescriptionAndOrderedTitles(
  arrOfTitles
) {
  if (!userDescriptionRequirements === "") {
    userDescriptionRequirementsAddendum =
      "The user has requested the following things be included in the description: " +
      userDescriptionRequirements;
  }
  console.log(
    "this is the user description requirements addendum within the chatGpt function",
    userDescriptionRequirements
  );
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `You are about to be given an arr of titles containing one or more books. I need you to write a marketing descripion of the books for eBay and then list the 
        the books one perline, numbered in order. MAKE SURE THE DESCRIPTION IS AT THE TOP BEFORE YOU LIST THE BOOKS. And this will be html so have a new line symbol at the end of every book listed. If the books are all by one author, mention that, and talk a little bit about 
        the author. And do not have repeat entries. Here are the books: ${arrOfTitles} "The user has requested the following things be included in the description: " +
     ${userDescriptionRequirements};`,
      },
    ],
    stream: true,
  });
  let responseContent = "";
  for await (const part of stream) {
    responseContent += part.choices[0]?.delta?.content || "";
  }

  console.log("this is the response content", responseContent);
  return responseContent;
}

function extractLinesWithNumbers(ocrText) {
  // Split the text into lines and filter out those that contain numbers
  return ocrText
    .split("\n")
    .filter((line) => /\d/.test(line))
    .join("\n");
}

async function getBooksCountFromChatGPT(img) {
  // Assuming the first item is a buffer or a string
  const base64Image = Buffer.from(img).toString("base64");

  // You can now send this base64Encoded string to your API

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Given an image of books, please count the number of books in the image and return the count. Return the count in the following format:

{
 Books: NUMBER
}

Please ensure that the content is exactly in the format shown above. This is critical as the output will be processed directly by another API.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });
  // console.log(
  //   "here is chat GPTs response to the INITAL book image",
  //   response.choices[0]
  // );

  return response.choices[0];
}
