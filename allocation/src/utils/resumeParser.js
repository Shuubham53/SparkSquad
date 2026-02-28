import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage, db } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

// API Key Fix: Quotes ke andar honi chahiye varna Syntax Error aayega
const genAI = new GoogleGenerativeAI("AIzaSyBjdK11puR39dqG9SW-FgEKU5vUrzCmlxg"); 

// Ye functions dashboard mang raha hai, toh hum inhe placeholder de dete hain
// Taaki dashboard crash na ho
export const extractTextFromPDF = async (file) => {
  return "PDF Text Placeholder"; 
};

export const extractSkillsFromText = (text) => {
  return ["Skill1", "Skill2"]; 
};

export const processResumeAI = async (studentId, file) => {
  try {
    // 1. Firebase Storage Upload
    const storageRef = ref(storage, `resumes/${studentId}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // 2. Gemini AI Analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the attached resume and return a JSON object with:
      - extractedSkills: Array of technical skills.
      - resumeScore: Quality score 0-100.
      - skillDensity: Keyword concentration 0-100.
      - summary: A short professional bio.
      
      Return ONLY valid JSON format.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: await fileToBase64(file),
          mimeType: file.type
        }
      }
    ]);

    const response = await result.response;
    const cleanJson = response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    let rankingBadge = 'potential';
    if (data.resumeScore > 80) rankingBadge = 'top';
    else if (data.resumeScore > 60) rankingBadge = 'strong';

    // 3. Firestore Update
    const studentRef = doc(db, "users", studentId);
    await updateDoc(studentRef, {
      extractedSkills: data.extractedSkills,
      resumeURL: downloadURL,
      resumeScore: data.resumeScore,
      skillDensity: data.skillDensity,
      rankingBadge: rankingBadge,
      profileSummary: data.summary,
      profileUpdated: true,
      lastUpdated: new Date().toISOString()
    });

    return { success: true, data, downloadURL };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { success: false, error: "AI could not process the resume." };
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};