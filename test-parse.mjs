import { PDFParse } from 'pdf-parse';
import fs from 'fs';

async function test() {
  try {
    // Just write a small test. We don't have a real PDF file handy, 
    // but we can instantiate PDFParse with a dummy buffer and see if it throws.
    const parser = new PDFParse({ data: Buffer.from([]) });
    console.log("Instantiated parser successfully");
    // This will probably throw because the PDF buffer is empty/invalid, 
    // but we want to see if the API structure is correct.
    try {
      await parser.getText();
    } catch (err) {
      console.log("Expected throw from empty buffer:", err.message);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}
test();
