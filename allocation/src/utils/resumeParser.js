import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage, db } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

// API Key ko environment variable se load karein
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const processResumeAI = async (studentId, file) => {
  try {
    // 1. Firebase Storage mein file upload
    const storageRef = ref(storage, `resumes/${studentId}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // 2. Gemini AI Analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Improved prompt for ApplicantCard metrics
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
    const data = JSON.parse(response.text().replace(/```json|```/g, ""));

    // Ranking logic for the medals in ApplicantCard
    let rankingBadge = 'potential';
    if (data.resumeScore > 80) rankingBadge = 'top';
    else if (data.resumeScore > 60) rankingBadge = 'strong';

    // 3. Firestore mein Student ki profile update
    const studentRef = doc(db, "users", studentId);
    await updateDoc(studentRef, {
      extractedSkills: data.extractedSkills,
      resumeURL: downloadURL,
      resumeScore: data.resumeScore,
      skillDensity: data.skillDensity,
      rankingBadge: rankingBadge, // 🥇, 🥈, 🥉 logic ke liye
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