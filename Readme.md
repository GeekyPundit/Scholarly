# Project Documentation

## Project Title & Tagline
### **Fork Experts — Scholarly**
*A multilingual, Minecraft-themed AI assistant that simplifies academic documents, forms, and rules for every student.*

---

# What is the problem?

Students often struggle with academic documents — forms, exam procedures, scholarship PDFs, and official notices — because they are written in complex, formal English. This results in:

- Mistakes in form submissions  
- Missed deadlines and lost opportunities  
- Repeated visits to administrative offices  
- Added difficulty for non-English-medium and first-generation learners

---

# What Problem Does Scholarly Actually Solve?

Scholarly acts as a bridge between academic documents and students. It:

- Reads any uploaded notice, form, or PDF  
- Extracts important information using OCR  
- Simplifies the language into clear bullet points  
- Explains everything in the user’s preferred language  
- Provides step-by-step guidance for academic tasks  
- Uses a Minecraft-inspired interface to make learning friendly and less intimidating  

We chose this problem because academic literacy is a hidden barrier — and solving it empowers lakhs of students instantly.

---

## Core Features

- **Multilingual Q&A:** Answers academic questions in English, Hindi, Bengali, Odia, and mixed languages.  
- **OCR Document Reading:** Upload PDFs/forms; extracts key info and simplifies it.  
- **Step-by-Step Guidance:** Clear workflows for exams, scholarships, re-evaluation, backlog, TC/migration, etc.  
- **Document Simplification:** Converts complex academic text into easy summaries with key actions.  
- **Knowledge Base:** Centralized academic rules and FAQs.  
- **Minecraft-Themed UI:** Pixel-styled, friendly, gamified interface.  
- **Context-Aware Chat:** Remembers previous queries and document uploads.  


## Tech Stack
- **NLP:** Transformer-based models  
- **OCR:** Advanced text extraction  
- **Frontend:** React + TailwindCSS  
- **Backend:** Node.js / Python  
- **Database:** SQLite
- **Deployment:** Cloud/containers  
- **APIs:** Workflow & OCR APIs  

## Challenges We Ran Into

- **Handling low-quality or complex academic PDFs during OCR**  
  Many notices had poor scans, tables, signatures, and mixed Bengali–English content, making extraction difficult.

- **Maintaining accuracy while simplifying dense, formal text**  
  We had to keep all rules, deadlines, and instructions intact while still making the output beginner-friendly.

- **Designing a Minecraft-inspired UI that stays fun yet professional**  
  Balancing a game-like aesthetic with academic seriousness required multiple iterations.

- **Ensuring fast processing for large and multilingual documents**  
  Heavy PDFs slowed down the pipeline, so we optimized OCR, caching, and text-processing workflows.


## Bonus Challenges (From Our Mentor)

- **Adding OCR language-switch in explanation & summary**  
  *Users should be able to switch the output language instantly (English → Bengali → Hindi).*

- **Building an extension** 
  *The assistant should work on external educational websites (WBJEE, JEE Main, college portals) and translate academic content into any chosen language for easier understanding. Its different from other translator extension as it does not have any rate limit*

### How We Solved the Bonus Challenges  

- **Instant OCR Language Switch**  
  We built a dynamic translation layer on top of the OCR output, allowing users to switch between English, Bengali, and Hindi instantly — without re-uploading or reprocessing the document.

- **Zero-Rate-Limit Extension Prototype**  
  Our extension connects directly to our backend instead of public APIs, enabling unlimited translations, faster simplification, and smooth performance even on heavy academic websites.

---

## Future Steps

- **Adaptive Learning Mode**  
  The assistant analyzes a student’s previous queries and documents to personalize explanations, difficulty levels, and recommended actions.

- **Auto-Structured Document Generation**  
  Convert complex notices or rules into automatically generated, clean, student-friendly formats—summaries, checklists, timelines, or step-by-step workflows.

- **Universal Academic Parser (UAP)**  
  A single engine that can read any academic website or PDF structure—forms, notices, syllabi, regulations—and instantly reorganize it into understandable sections.

- **Institution Connect API**  
  Colleges and schools can integrate our API to automatically generate simplified versions of their notices in multiple languages for all students.

---

## Team Members

- **Anish Chatterjee** — NLP & AI Integration  
- **Arghyadeep Sen** — Frontend Developer & UI/UX (Minecraft-themed interface)  
- **Subha Maji** —  Documentation, Testing, User Journey & Presentation  
- **Pravanjan Roy** —  Backend, OCR Pipeline, API Development

---

**Built with love at EDU-A-THON 2.0 — 2025 ❤️**
