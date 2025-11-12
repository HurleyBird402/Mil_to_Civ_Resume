from flask import Flask, request, render_template_string
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re

print(">>> Starting app.py (sanity check)")

# Load environment variables safely
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("⚠️  Warning: OPENAI_API_KEY not found in .env file.")
else:
    print("✅ OpenAI API key loaded successfully.")

client = OpenAI(api_key=api_key) if api_key else None

app = Flask(__name__)

# Load glossary from JSON
def load_glossary():
    with open("glossary.json", "r", encoding="utf-8") as f:
        return json.load(f)

glossary = load_glossary()
print(f"✅ Loaded {len(glossary)} glossary entries.")

def apply_glossary(text):
    """Replace military terms with civilian equivalents from the glossary."""
    for military_term, civilian_term in glossary.items():
        # Use regex for case-insensitive whole-word replacement
        text = re.sub(rf"\b{re.escape(military_term)}\b", civilian_term, text, flags=re.IGNORECASE)
    return text


SYSTEM_PROMPT = """
You are a specialized AI assistant that converts U.S. military resumes into polished civilian resumes.
Translate rank titles, positions, and jargon into equivalent corporate or civilian language.

Guidelines:
- Replace military terms with corporate equivalents (e.g., "Company Commander" → "Director").
- Keep achievements results-oriented and civilian-friendly.
- Maintain a professional resume tone.
- Never use military acronyms unless clarified.
- Output only the rewritten resume text.
"""

@app.route("/", methods=["GET", "POST"])
def home():
    output_text = ""
    if request.method == "POST" and client:
        input_text = request.form["resume_text"]

        # Apply glossary before sending to OpenAI
        input_text = apply_glossary(input_text)

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": input_text}
                ]
            )
            output_text = response.choices[0].message.content.strip()
        except Exception as e:
            output_text = f"Error calling OpenAI API: {e}"

    return render_template_string("""
        <html>
            <head>
                <title>Military to Civilian Resume Converter</title>
                <style>
                    body { font-family: Arial; max-width: 700px; margin: auto; padding: 2rem; }
                    textarea { width: 100%; height: 200px; margin-bottom: 1rem; }
                    button { background: #2d6cdf; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 8px; }
                    .output { background: #f4f4f4; padding: 1rem; border-radius: 8px; white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h2>Military → Civilian Resume Converter</h2>
                <form method="POST">
                    <label>Paste your military resume text below:</label><br><br>
                    <textarea name="resume_text" placeholder="Enter or paste your resume here..."></textarea><br>
                    <button type="submit">Convert Resume</button>
                </form>
                {% if output_text %}
                    <h3>Converted Civilian Resume:</h3>
                    <div class="output">{{ output_text }}</div>
                {% endif %}
            </body>
        </html>
    """, output_text=output_text)

@app.route("/glossary", methods=["GET", "POST"])
def edit_glossary():
    message = ""

    if request.method == "POST":
        military_term = request.form["military_term"].strip().lower()
        civilian_term = request.form["civilian_term"].strip()

        if military_term and civilian_term:
            glossary[military_term] = civilian_term
            with open("glossary.json", "w", encoding="utf-8") as f:
                json.dump(glossary, f, indent=4)
            message = f"✅ Added/Updated term: '{military_term}' → '{civilian_term}'"
        else:
            message = "⚠️ Both fields are required."

    glossary_items = sorted(glossary.items())

    return render_template_string("""
        <html>
            <head>
                <title>Edit Glossary</title>
                <style>
                    body { font-family: Arial; max-width: 700px; margin: auto; padding: 2rem; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background: #eee; }
                    input[type=text] { width: 100%; padding: 8px; margin-bottom: 1rem; }
                    button { background: #2d6cdf; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 8px; }
                    a { text-decoration: none; color: #2d6cdf; }
                    .message { margin-bottom: 1rem; }
                </style>
            </head>
            <body>
                <h2>Glossary Management</h2>
                <div class="message">{{ message }}</div>

                <form method="POST">
                    <label>Military Term:</label><br>
                    <input type="text" name="military_term" placeholder="e.g. company commander"><br>
                    <label>Civilian Equivalent:</label><br>
                    <input type="text" name="civilian_term" placeholder="e.g. director"><br>
                    <button type="submit">Add / Update Term</button>
                </form>

                <h3>Current Glossary</h3>
                <table>
                    <tr><th>Military Term</th><th>Civilian Equivalent</th></tr>
                    {% for m, c in glossary_items %}
                        <tr><td>{{ m }}</td><td>{{ c }}</td></tr>
                    {% endfor %}
                </table>

                <a href="/">← Back to Resume Converter</a>
            </body>
        </html>
    """, glossary_items=glossary_items, message=message)

if __name__ == "__main__":
    app.run(debug=True)