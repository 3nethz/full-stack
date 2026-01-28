//app.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let sharedStories = [];
let translationHistory = [];
let storyViews = {};

const emojiDict = { "meaning": "emoji"} //We need a mapping of emoji to meaning I couldn't find one in the time


const translateToEmoji = (text, dictionary) => {
  if (!text) return "";
  const cleanText = text.toLowerCase().replace(/[.,!?;]/g, "");
  return cleanText
    .split(/\s+/)
    .map(word => {
      return dictionary[word] || word;
    })
    .join(" ");
};

const translateFromEmoji = (input, toEmoji) => {
  if (!input) return "";
  const reverseDict = Object.fromEntries(
    Object.entries(emojiDict).map(([text, emoji]) => [emoji, text])
  );
  const activeDict = toEmoji ? emojiDict : reverseDict;
  const tokens = toEmoji ? input.toLowerCase().split(/\s+/) : [...input];
  return tokens
    .map(token => activeDict[token] || token)
    .join(toEmoji ? " " : " ") 
    .trim();
};

app.post('/share', (req, res) => {
  try {
    const {emojiSequence, author} = req.body;
    
    if (!emojiSequence || !author) {
      return res.status(400).json({error: "emojiSequence and author are required"});
    }
    
    if (typeof emojiSequence !== 'string' || typeof author !== 'string') {
      return res.status(400).json({error: "Invalid data types"});
    }
    const newStory = {
      id: Date.now(), 
      emojiSequence, 
      author, 
      createdAt: new Date()
    };
    
    sharedStories.push(newStory);
    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({error: "Server error"});
  }
});

app.get('/stories', (req, res) => {
  try {
    const storiesWithViews = sharedStories.map(story => ({
      ...story,
      views: storyViews[story.id] || 0
    }));
    res.json(storiesWithViews);
  } catch (error) {
    res.status(500).json({error: "Server error"});
  }
});

app.get('/', (req, res)=> {
    res.status(200).send("Welcome to Emoji Server");
});

app.post('/translate', (req, res) => {
  try {
    const {text, toEmoji} = req.body;
    
    if (!text) {
      return res.status(400).json({error: "Text is required"});
    }
    
    if (typeof text !== 'string') {
      return res.status(400).json({error: "Invalid text format"});
    }
    
    const translated = toEmoji ? translateToEmoji(text) : translateFromEmoji(text);
    
    translationHistory.push({
      original: text,
      translated: translated,
      timestamp: new Date()
    });
    res.json({translated});
  } catch (error) {
    res.status(500).json({error: "Translation failed"});
  }
});

app.listen(PORT, (error) => {
    if(!error)
        console.log("Server is Successfully Running,and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);
