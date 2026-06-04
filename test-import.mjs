async function test() {
  try {
    const { PDFParse } = await import('pdf-parse');
    console.log("Import success, PDFParse type:", typeof PDFParse);
  } catch (err) {
    console.error("Import failed:", err);
  }
}
test();
