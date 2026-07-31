from flask import Flask, request, jsonify
from transformers import pipeline
from pypdf import PdfReader
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

print("Loading models...")

MODEL_NAME = os.getenv("MODEL_NAME", "facebook/bart-large-cnn")
AI_PORT = int(os.getenv("AI_PORT", 5000))

chunk_summarizer = pipeline(
    "summarization",
    model=MODEL_NAME, 
    device=-1
)

final_summarizer = pipeline(
    "summarization",
    model=MODEL_NAME,
    device=-1
)

def clean_document(text):
    remove_words = [
        "DECLARATION AND STATEMENT OF AUTHORSHIP",
        "Plagiarism",
        "I/we have not",
        "Student ID",
        "Cover Sheet",
        "Signature"
    ]
    lines = text.split("\n")
    result = []
    for line in lines:
        if not any(word.lower() in line.lower() for word in remove_words):
            result.append(line)
    return "\n".join(result)

def split_text(text, max_chunk_size=800):
    """Split text into smaller chunks that fit in memory"""
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_chunk_size):
        chunk = " ".join(words[i:i+max_chunk_size])
        chunks.append(chunk)
    return chunks

def clean_bullet_text(text):
    """Remove bullet points and extra formatting"""
    text = re.sub(r'[•\-\*]\s*', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def remove_redundancy(sentences):
    """Remove redundant and repetitive sentences"""
    seen = set()
    unique = []
    
    for sentence in sentences:
        # Clean and normalize
        clean = sentence.strip()
        normalized = ' '.join(clean.lower().split())
        
        # Skip short/incomplete sentences
        if len(clean.split()) < 8:  # At least 8 words
            continue
            
        # Check for near-duplicates (fuzzy matching)
        is_duplicate = False
        for seen_text in seen:
            # If 80% similar, consider it a duplicate
            if len(set(normalized.split()) & set(seen_text.split())) / len(set(normalized.split())) > 0.8:
                is_duplicate = True
                break
                
        if not is_duplicate:
            seen.add(normalized)
            unique.append(clean)
    
    return unique

def generate_summary(text):
    print(f"Original text length: {len(text)} characters")
    
    # Step 1: Clean the document
    text = clean_document(text)
    
    # Step 2: Split into very small chunks for 8GB RAM
    chunks = split_text(text, max_chunk_size=500)
    print(f"Split into {len(chunks)} chunks")
    
    # Step 3: Summarize each chunk
    chunk_summaries = []
    
    for index, chunk in enumerate(chunks):
        print(f"Processing chunk {index+1}/{len(chunks)}")
        
        try:
            result = chunk_summarizer(
                chunk,
                max_length=150,
                min_length=30,
                do_sample=False,
                num_beams=4,
                repetition_penalty=3.0,
                no_repeat_ngram_size=3,
                early_stopping=True
            )
            chunk_summaries.append(result[0]["summary_text"])
        except Exception as e:
            print(f"Error processing chunk {index+1}: {e}")
            continue
    
    if not chunk_summaries:
        return "• Failed to generate summary"
    
    # Step 4: Combine chunk summaries
    combined_summaries = " ".join(chunk_summaries)
    print(f"Combined summaries length: {len(combined_summaries)}")
    
    # Step 5: If combined is still too long, do a final summary
    if len(combined_summaries.split()) > 100:
        print("Performing final summary...")
        try:
            final_result = final_summarizer(
                combined_summaries,
                max_length=300,
                min_length=100,
                do_sample=False,
                num_beams=4,
                repetition_penalty=4.0,
                no_repeat_ngram_size=4,
                early_stopping=True
            )
            final_text = final_result[0]["summary_text"]
        except:
            final_text = combined_summaries
    else:
        final_text = combined_summaries
    
    # Step 6: Clean and format
    sentences = re.split(r'(?<=[.!?])\s+', final_text)
    sentences = remove_redundancy(sentences)
    
    # Step 7: Format as bullets
    bullet_points = []
    for sentence in sentences:
        # Ensure it's a complete thought
        if sentence.strip():
            # Capitalize first letter
            sentence = sentence.strip()
            sentence = sentence[0].upper() + sentence[1:] if sentence else sentence
            bullet_points.append(f"• {sentence}")
    
    if not bullet_points:
        return "• No meaningful summary could be generated"
    
    return "\n".join(bullet_points[:10])  # Limit to top 10 bullet points

@app.route("/summary", methods=["POST"])
def summary():
    file = request.files["file"]
    print("Received file:", file.filename)
    
    temp_file = "temp.pdf"
    file.save(temp_file)
    
    reader = PdfReader(temp_file)
    text = ""
    
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text += page_text + " "

    print("====================")
    print(text[:2000])
    print("====================")
    
    print(f"Extracted {len(text)} characters from PDF")
    
    result = generate_summary(text)
    
    return jsonify({
        "summary": result
    })

if __name__ == "__main__":
    app.run(port=AI_PORT)