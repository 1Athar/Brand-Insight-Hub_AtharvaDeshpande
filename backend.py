'''import time
import os
import re
from openai import OpenAI
from playwright.sync_api import sync_playwright

# ---------------------------------
# NVIDIA LLM CONFIGURATION
# ---------------------------------
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

# ---------------------------------
# STEP 1: GENERATE QUESTIONS
# ---------------------------------
category = input("Enter the category: ")
brands = input("Enter competitive brands: ")

print("[+] Generating questions...")
completion = client.chat.completions.create(
    model="meta/llama-3.3-70b-instruct",
    messages=[{"role": "user", "content": f"Generate 3 general questions about {category},Also while generating questions keep in mind that it requires brand names inputted {brands} to be answered by any LLM like chatgpt,deepseek and many more but questions should not contain {brands} names. Format: 1. Question"}],
)
raw_text = completion.choices[0].message.content
questions = re.findall(r'^\d\.\s*(.*)', raw_text, re.MULTILINE)[:3]

# ---------------------------------
# STEP 2: PLAYWRIGHT AUTOMATION
# ---------------------------------
answers = []
user_data_dir = os.path.join(os.getcwd(), "chatgpt_session")

def clear_overlays(page):
    """Dismisses specific banners that block the UI."""
    try:
        # Dismiss 'Maybe later' or 'Go Plan' popups
        page.get_by_text("Maybe later").click(timeout=1000)
    except: pass
    
    try:
        # Dismiss cookie or legal disclaimer 'x' button
        # Usually found in a button within a flex container at the bottom
        page.locator("div.flex.items-center.justify-center button").last.click(timeout=1000)
    except: pass

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir,
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = context.new_page()
    page.goto("https://chatgpt.com/")

    # Initial check for login or input box
    try:
        page.wait_for_selector("#prompt-textarea", timeout=15000)
    except:
        print("\n[!] Please log in or ensure the 'Ask anything' box is visible...")
        page.wait_for_selector("#prompt-textarea", timeout=0)

    for idx, question in enumerate(questions, start=1):
        print(f"\n[Q{idx}] Asking: {question[:50]}...")
        
        clear_overlays(page)

        # 1. Targeted fill using the ID (Bypasses hidden fallback textareas)
        prompt = page.locator("#prompt-textarea")
        
        # We click first to ensure the UI is active
        prompt.click()
        prompt.fill(question)
        time.sleep(0.5)
        page.keyboard.press("Enter")

        # 2. WAIT FOR COMPLETION USING VOICE ICON
        # The 'Read aloud' button appears ONLY after generation is fully finished.
        print("Waiting for 'Read aloud' speaker icon (Generation Finish)...")
        try:
            # We wait for the speaker icon in the last assistant message
            # Selector: aria-label='Read aloud' inside the last article
            time.sleep(3) # Small buffer for generation to start
            
            # This is your clever logic: wait for the voice button to signal completion
            voice_button = page.locator("article").last.get_by_label("Read aloud")
            voice_button.wait_for(state="visible", timeout=5000) # 2 min timeout for long answers
            
            print(f"[✓] Voice icon detected. Response {idx} complete.")
        except Exception as e:
            print(f"[!] Warning: Voice icon didn't appear in time. Attempting capture...")

        # 3. CAPTURE ANSWER
        time.sleep(1) # Buffer for DOM stability
        try:
            # Capture the markdown-formatted text from the last article (response)
            answer_text = page.locator("article").last.locator(".markdown").inner_text()
            answers.append(answer_text)
            print(f"[✓] Captured Answer {idx}")
        except:
            answers.append("Error: Text block not found.")

    context.close()

# ---------------------------------
# FINAL OUTPUT
# ---------------------------------
print("\n" + "="*50 + "\nFINAL Q&A RESULTS\n" + "="*50)
for i, (q, a) in enumerate(zip(questions, answers), start=1):
    print(f"Q{i}: {q}\nA{i}: {a}...\n{'-'*50}")'''

'''import time
import os
import re
from openai import OpenAI
from playwright.sync_api import sync_playwright

# ---------------------------------
# NVIDIA LLM CONFIGURATION
# ---------------------------------
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

# ---------------------------------
# STEP 1: INPUTS & GENERATION
# ---------------------------------
category = input("Enter the category: ")
brands = input("Enter competitive brands (comma-separated): ")

print("[+] Generating questions via NVIDIA LLM...")
# Using r"" raw string to fix the SyntaxWarning
prompt_text = (f"Generate 3 general questions about {category}. "
               f"Answers should naturally require mentioning brands like {brands}, "
               f"but the questions must NOT contain brand names. Format: 1. Question"
               f"Questions should be framed in such a way that it requires use of  web search tools for answering these questions about {category} by other LLMs. ")

completion = client.chat.completions.create(
    model="meta/llama-3.3-70b-instruct",
    messages=[{"role": "user", "content": prompt_text}],
)
raw_text = completion.choices[0].message.content
questions = re.findall(r"^\d\.\s*(.*)", raw_text, re.MULTILINE)[:3]

# ---------------------------------
# STEP 2: PLAYWRIGHT AUTOMATION
# ---------------------------------
final_data = [] 
user_data_dir = os.path.join(os.getcwd(), "chatgpt_session")

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir,
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = context.new_page()
    page.goto("https://chatgpt.com/")

    # Ensure interface is loaded
    print("[+] Waiting for ChatGPT interface...")
    page.wait_for_selector("#prompt-textarea", timeout=0)

    for idx, question in enumerate(questions, start=1):
        print(f"\n[Q{idx}] Processing...")
        

        # --- B. SEND QUESTION ---
        prompt = page.locator("#prompt-textarea")
        prompt.click()
        prompt.fill(question)
        time.sleep(0.5)
        page.keyboard.press("Enter")

        # --- C. WAIT FOR COMPLETION (Voice Icon Trigger) ---
        print("    - Waiting for response (Watching for 'Read aloud' icon)...")
        try:
            time.sleep(10) # Web search takes a few seconds to start
            # 'Read aloud' is the most stable completion indicator
            voice_button = page.locator("article").last.get_by_label("Read aloud")
            voice_button.wait_for(state="visible", timeout=8000)
            print("    - [✓] AI finished writing.")
        except:
            print("    - [!] Warning: Voice icon not detected. Capturing current state.")

        # --- D. DATA EXTRACTION ---
        time.sleep(2)
        try:
            last_msg = page.locator("article").last
            answer_text = last_msg.locator(".markdown").inner_text()
            
            citations = []
            
            # 1. Standard Hyperlinks
            links = last_msg.locator(".markdown a")
            for i in range(links.count()):
                citations.append({
                    "text": links.nth(i).inner_text().strip(),
                    "url": links.nth(i).get_attribute("href")
                })
            
            # 2. Source Chips (The gray bubbles seen in your screenshots)
            # Targets the Tailwind classes ChatGPT uses for citation chips
            chips = last_msg.locator("span.bg-token-main-surface-secondary, button:has-text('Source'), a[data-testid*='citation']")
            for i in range(chips.count()):
                chip_text = chips.nth(i).inner_text().strip()
                if chip_text and chip_text not in [c['text'] for c in citations]:
                    citations.append({"text": chip_text, "url": "Referenced as Chip/Bubble"})

            final_data.append({
                "question": question,
                "answer": answer_text,
                "citations": citations
            })
            print(f"    - [✓] Extracted {len(citations)} citations.")

        except Exception as e:
            print(f"    - [!] Extraction error: {e}")

    context.close()

# ---------------------------------
# FINAL DATA PRINT
# ---------------------------------
print("\n" + "="*80)
print("VERIFICATION REPORT: EXTRACTED Q&A DATA")
print("="*80)

for i, data in enumerate(final_data, start=1):
    print(f"\nQUESTION {i}: {data['question']}")
    print(f"ANSWER SUMMARY: {data['answer']}...")
    print(f"CITATIONS ({len(data['citations'])}):")
    if not data['citations']:
        print("  (None found)")
    else:
        for c in data['citations']:
            print(f"  - [{c['text']}] -> {c['url']}")
    print("-" * 40) '''

import time
import os
import re
import json  # Added for JSON storage
from openai import OpenAI
from playwright.sync_api import sync_playwright

# ---------------------------------
# NVIDIA LLM CONFIGURATION
# ---------------------------------
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

# ---------------------------------
# STEP 1: INPUTS & GENERATION
# ---------------------------------
my_brand = input("Enter YOUR brand name: ")
category = input("Enter the category: ")
brands_input = input("Enter competitive brands (comma-separated): ")

competitive_brands = [b.strip() for b in brands_input.split(",") if b.strip()]
all_brands_to_track = [my_brand] + competitive_brands

print("[+] Generating questions via NVIDIA LLM...")
prompt_text = (f"Generate 3 general questions about {category}. "
               f"Answers should naturally require mentioning brands like {brands_input}, "
               f"but the questions must NOT contain brand names. Format: 1. Question "
               f"Questions should be framed in such a way that it requires use of web search tools for answering these questions about {category} by other LLMs. ")

completion = client.chat.completions.create(
    model="meta/llama-3.3-70b-instruct",
    messages=[{"role": "user", "content": prompt_text}],
)
raw_text = completion.choices[0].message.content
questions = re.findall(r"^\d\.\s*(.*)", raw_text, re.MULTILINE)[:3]

# ---------------------------------
# STEP 2: PLAYWRIGHT AUTOMATION
# ---------------------------------
final_data = [] 
user_data_dir = os.path.join(os.getcwd(), "chatgpt_session")

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir,
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = context.new_page()
    page.goto("https://chatgpt.com/")

    print("[+] Waiting for ChatGPT interface...")
    page.wait_for_selector("#prompt-textarea", timeout=0)

    for idx, question in enumerate(questions, start=1):
        print(f"\n[Q{idx}] Processing...")

        prompt = page.locator("#prompt-textarea")
        prompt.click()
        prompt.fill(question)
        time.sleep(0.5)
        page.keyboard.press("Enter")

        print("    - Waiting for response (Watching for 'Read aloud' icon)...")
        try:
            time.sleep(10) 
            voice_button = page.locator("article").last.get_by_label("Read aloud")
            voice_button.wait_for(state="visible", timeout=8000) # TIMER UNCHANGED
            print("    - [✓] AI finished writing.")
        except:
            print("    - [!] Warning: Voice icon not detected. Capturing current state.")

        time.sleep(2)
        try:
            last_msg = page.locator("article").last
            answer_text = last_msg.locator(".markdown").inner_text()
            
            citations = []
            links = last_msg.locator(".markdown a")
            for i in range(links.count()):
                citations.append({
                    "text": links.nth(i).inner_text().strip(),
                    "url": links.nth(i).get_attribute("href")
                })
            
            chips = last_msg.locator("span.bg-token-main-surface-secondary, button:has-text('Source'), a[data-testid*='citation']")
            for i in range(chips.count()):
                chip_text = chips.nth(i).inner_text().strip()
                if chip_text and chip_text not in [c['text'] for c in citations]:
                    citations.append({"text": chip_text, "url": "Referenced as Chip/Bubble"})

            final_data.append({
                "number": idx,
                "question": question,
                "answer": answer_text,
                "citations": citations
            })
            print(f"    - [✓] Extracted {len(citations)} citations.")

        except Exception as e:
            print(f"    - [!] Extraction error: {e}")

    context.close()

# ---------------------------------
# STEP 3: DATA VERIFICATION PRINT
# ---------------------------------
print("\n" + "="*80)
print("VERIFICATION REPORT: EXTRACTED Q&A DATA")
print("="*80)

for i, data in enumerate(final_data, start=1):
    print(f"\nQUESTION {i}: {data['question']}")
    print(f"ANSWER SUMMARY: {data['answer']}...")
    print(f"CITATIONS ({len(data['citations'])}):")
    if not data['citations']:
        print("  (None found)")
    else:
        for c in data['citations']:
            print(f"  - [{c['text']}] -> {c['url']}")
    print("-" * 40)

# ---------------------------------
# STEP 4: METRICS CALCULATION
# ---------------------------------
total_answers = len(final_data)
brand_metrics = {brand: {"mentions": 0, "citations": 0} for brand in all_brands_to_track}
citation_frequency = {}

prompts_with_my_brand = []
prompts_without_my_brand = []

for data in final_data:
    answer_lower = data['answer'].lower()
    citation_text_combined = " ".join([c['text'].lower() + " " + (c['url'] or "").lower() for c in data['citations']])
    
    for c in data['citations']:
        source_name = c['text']
        citation_frequency[source_name] = citation_frequency.get(source_name, 0) + 1

    for brand in all_brands_to_track:
        b_name = brand.lower()
        if b_name in answer_lower:
            brand_metrics[brand]["mentions"] += 1
        if b_name in citation_text_combined:
            brand_metrics[brand]["citations"] += 1

    if my_brand.lower() in answer_lower:
        prompts_with_my_brand.append({"id": data['number'], "question": data['question']})
    else:
        prompts_without_my_brand.append({"id": data['number'], "question": data['question']})

top_cited_pages = sorted(citation_frequency.items(), key=lambda x: x[1], reverse=True)

# ---------------------------------
# STEP 5: UPDATED STORAGE LOGIC (JSON)
# ---------------------------------
history_file = "chatgpt_history.json"
current_time = time.strftime("%Y-%m-%d %H:%M:%S")

# Create the session record
session_record = {
    "timestamp": current_time,
    "metadata": {
        "category": category,
        "my_brand": my_brand,
        "competitors": competitive_brands
    },
    "conversations": final_data,
    "metrics": {
        "visibility": {b: (brand_metrics[b]["mentions"]/total_answers)*100 for b in all_brands_to_track},
        "citation_share": {b: (brand_metrics[b]["citations"]/total_answers)*100 for b in all_brands_to_track},
        "top_cited_sources": top_cited_pages[:10]
    }
}

# Load existing history or start new list
if os.path.exists(history_file):
    with open(history_file, "r", encoding="utf-8") as rf:
        try:
            history_list = json.load(rf)
        except json.JSONDecodeError:
            history_list = []
else:
    history_list = []

# Append and Save
history_list.append(session_record)
with open(history_file, "w", encoding="utf-8") as wf:
    json.dump(history_list, wf, indent=4)

# ---------------------------------
# STEP 6: DISPLAY METRICS & HISTORY
# ---------------------------------
print("\n" + "="*80)
print("AI PERFORMANCE METRICS")
print("="*80)
print(f"{'Brand Name':<20} | {'AI Visibility':<15} | {'Citation Share':<15}")
print("-" * 60)

for brand in all_brands_to_track:
    vis = session_record["metrics"]["visibility"][brand]
    cit = session_record["metrics"]["citation_share"][brand]
    print(f"{brand:<20} | {vis:>13.2f}% | {cit:>13.2f}%")

print("\n" + "="*80)
print("TOP CITED PAGES / SOURCES")
print("="*80)
for source, count in top_cited_pages[:10]:
    print(f"{source:<40} | {count:<15}")

print("\n" + "="*80)
print("BRAND-SPECIFIC HISTORY")
print("="*80)

print(f"\n[+] Prompts where '{my_brand}' appeared in result:")
for p in prompts_with_my_brand: print(f"  - Q{p['id']}: {p['question']}")

print(f"\n[-] Prompts where '{my_brand}' did NOT appear:")
for p in prompts_without_my_brand: print(f"  - Q{p['id']}: {p['question']}")

print(f"\n[✓] History and UI-ready data saved to: {os.path.abspath(history_file)}")