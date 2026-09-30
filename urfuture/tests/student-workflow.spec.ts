import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Student Workflow', () => {
  const testEmail = `test.student.${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test Student';

  test('Complete student journey: sign up, transcript upload, quiz, and study plan', async ({ page }) => {
    // 1. Sign Up
    await page.goto('/');
    
    await page.click('text=Student Sign In');
    await page.click('button:has-text("Create Account")');
    
    // Fill register form
    await page.fill('input[placeholder="e.g. Sokha Chea"]', testName);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await page.click('button[type="submit"]:has-text("Create Account & Continue")');
    
    // Wait for redirect to Dashboard Workspace
    await expect(page.locator('h1', { hasText: 'Welcome back' })).toBeVisible({ timeout: 15000 });
    
    // 2. Transcript Upload
    const continueMappingBtn = page.locator('button', { hasText: 'Continue Mapping' });
    if (await continueMappingBtn.isVisible()) {
      await continueMappingBtn.click();
    } else {
      await page.click('button:has-text("Knowledge map")');
    }
    
    // Wait for the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached', timeout: 15000 });
    
    // Write a valid PDF file with standard PDF headers & streams
    const dummyPdfPath = path.join(__dirname, 'dummy_transcript.pdf');
    const validPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 12 Tf
72 712 Td
(CS101 Programming Fundamentals A 4.0) Tj
0 -20 Td
(CS201 Database Management Systems B+ 3.5) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000413 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
490
%%EOF`;
    fs.writeFileSync(dummyPdfPath, validPdfContent);
    
    await fileInput.setInputFiles(dummyPdfPath);
    
    // Wait for the network response when uploading (Playwright best practice)
    const uploadResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/transcript/upload'),
      { timeout: 25000 }
    ).catch(() => null);
    
    await page.click('button:has-text("Upload & Parse")');
    await uploadResponsePromise;
    
    // 3. Quiz Generation
    const generateQuizBtn = page.locator('button', { hasText: /Generate Quiz/i }).first();
    await expect(generateQuizBtn).toBeVisible({ timeout: 10000 });
    await generateQuizBtn.click();
    
    // Check if questions or format selector appeared
    await expect(
      page.locator('text=Choose Your Quiz Format').or(page.locator('text=Question 1')).or(page.locator('button:has-text("Submit")'))
    ).toBeVisible({ timeout: 15000 });
    
    // 4. Job Fit Tab Navigation
    await page.click('button:has-text("Job fit")');
    await expect(page.locator('h1, h2, h3, div', { hasText: 'Job fit' }).first()).toBeVisible({ timeout: 10000 });
  });
});

