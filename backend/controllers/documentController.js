const Tesseract = require("tesseract.js");
const pool = require("../config/db");
const fs = require("fs");

exports.processDocument = async (req, res) => {
  try {
    // Run OCR on uploaded document
    const { path } = req.file;
    const {
      data: { text },
    } = await Tesseract.recognize(path, "eng");

    // Use regex or parsing logic to extract fields from text
    const extractedData = {
      name: extractName(text),
      documentNumber: extractDocumentNumber(text),
      issueDate: extractIssueDate(text),
      expirationDate: extractExpirationDate(text),
    };

    // Insert extracted data into the database
    await pool.query(
      "INSERT INTO documents (name, document_number, issue_date, expiration_date) VALUES ($1, $2, $3, $4) ON CONFLICT (document_number) DO NOTHING",
      [
        extractedData.name,
        extractedData.documentNumber,
        extractedData.issueDate || null,
        extractedData.expirationDate || null,
      ]
    );
    
    // Delete the uploaded file after processing
    fs.unlinkSync(path);

    res.json({ message: "Document processed and saved", extractedData });
  } catch (error) {
    res.status(500).json({ message: "Error processing document", error });
  }
};

// Modify this function to extract the actual name from the OCR text
function extractName(text) {
  const nameMatch = text.match(/Name:\s*(.+)/i); // Example pattern
  return nameMatch ? nameMatch[1].trim() : "Unknown Name";
}

// Modify this function to extract the actual document number from the OCR text
function extractDocumentNumber(text) {
  const docNumberMatch = text.match(/Document Number:\s*(\d+)/i); // Example pattern
  return docNumberMatch ? docNumberMatch[1] : "Unknown Document Number";
}

function extractIssueDate(text) {
  const issueDateMatch = text.match(/Issue Date:\s*(\d{4}-\d{2}-\d{2})/i);  // YYYY-MM-DD format
  if (issueDateMatch) {
    return formatDate(issueDateMatch[1]);  // Format date
  }
  return null;
}

function extractExpirationDate(text) {
  const expirationDateMatch = text.match(/Expiration Date:\s*(\d{4}-\d{2}-\d{2})/i);  // YYYY-MM-DD format
  if (expirationDateMatch) {
    return formatDate(expirationDateMatch[1]);  // Format date
  }
  return null;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

