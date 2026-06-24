const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const crypto = require("crypto");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/prompt", async (req, res) => {
  try {
    let { User_ID, Prompt, Attachment, Search_Internet, session_ID } = req.body;

    if (!User_ID || !Prompt) {
      return res.status(400).json({
        status: "error",
        message: "User_ID and Prompt are required",
      });
    }

    if (!session_ID) {
      session_ID = crypto.randomBytes(16).toString("hex");
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: Prompt,
    });

    const aiText = result.text || "No response generated.";

    const responseText = `
      <div>
        <p>${aiText.replace(/\n/g, "<br/>")}</p>
      </div>
    `;

    let session = await Session.findOne({ session_ID });

    if (!session) {
      session = new Session({
        session_ID,
        User_ID,
        prompts: [],
      });
    }

    session.prompts.push({
      prompt: Prompt,
      attachment: Attachment || "",
      search_internet: Search_Internet === "on",
      response: responseText,
    });

    await session.save();

    return res.json({
      User_ID,
      session_ID,
      response_text: responseText,
      Attachment: null,
      status: "success",
    });
  } catch (error) {
    console.error("Gemini Prompt API error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;