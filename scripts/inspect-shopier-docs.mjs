import { readFileSync, existsSync } from "node:fs";

const filePath = "C:\\Users\\samet\\.gemini\\antigravity\\brain\\f77c5d63-45da-45d3-b250-adf474ac29ce\\.system_generated\\steps\\3209\\content.md";

if (existsSync(filePath)) {
  const content = readFileSync(filePath, "utf8");
  console.log("=== WEBHOOK CODE BLOCKS ===");
  
  // Find code blocks like ```javascript or ```node or ```express or general code blocks
  const regex = /```(javascript|node|typescript|js|json|php|python|shell|curl)?([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log("--- Code block (" + (match[1] || "none") + ") ---");
    console.log(match[2].trim());
  }
} else {
  console.error("File not found:", filePath);
}
