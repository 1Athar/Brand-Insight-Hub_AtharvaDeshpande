import time
import os
import re
import json
from typing import List, Dict, Optional
from urllib.parse import urlparse
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from playwright.sync_api import sync_playwright

# ---------------------------------
# INITIALIZATION
# ---------------------------------
app = FastAPI(title="AI Brand Presence Tracker API")

# Enable CORS for Lovable frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

HISTORY_FILE = "chatgpt_history.json"

# ---------------------------------
# DATA MODELS
# ---------------------------------
class AnalysisRequest(BaseModel):
    my_brand: str
    category: str
    competitors: str

# ---------------------------------
# HELPER FUNCTIONS
# ---------------------------------
def get_domain(url: str) -> str:
    try:
        domain = urlparse(url).netloc
        return domain.replace('www.', '') if domain else "Source"
    except:
        return "Source"

def calculate_rank(answer_text: str, brand_name: str, all_brands: List[str]) -> Optional[int]:
    """Determines the order (1st, 2nd, etc.) in which the brand appears in the response."""
    text_lower = answer_text.lower()
    brand_positions = {}
    for b in all_brands:
        pos = text_lower.find(b.lower())
        if pos != -1:
            brand_positions[b] = pos
    
    # Sort brands by their first appearance in the text
    sorted_brands = sorted(brand_positions, key=brand_positions.get)
    if brand_name in sorted_brands:
        return sorted_brands.index(brand_name) + 1
    return None

def clear_overlays(page):
    """Dismisses popups and cookie banners."""
    try:
        page.get_by_text("Maybe later", exact=True).click(timeout=1500)
    except: pass
    try:
        page.locator("div.flex.items-center.justify-center button").last.click(timeout=1000)
    except: pass

# ---------------------------------
# THE ANALYSIS ENGINE
# ---------------------------------
def run_full_analysis_task(my_brand: str, category: str, competitors_str: str):
    competitive_brands = [b.strip() for b in competitors_str.split(",") if b.strip()]
    all_brands = [my_brand] + competitive_brands

    # 1. GENERATE SEARCH-OPTIMIZED QUESTIONS
    print(f"[+] Generating questions for {category}...")
    prompt_text = (
        f"Generate 2 general questions about {category}. "
        f"Answers should naturally require mentioning brands like {competitors_str} and {my_brand}, "
        f"but the questions must NOT contain brand names. "
        f"Frame questions that specifically require the use of web search tools to answer."
    )

    completion = client.chat.completions.create(
        model="meta/llama-3.3-70b-instruct",
        messages=[{"role": "user", "content": prompt_text}],
    )
    # Extract questions (basic regex to catch numbered lists)
    questions = re.findall(r"^\d\.\s*(.*)", completion.choices[0].message.content, re.MULTILINE)[:3]

    # 2. BROWSER AUTOMATION
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

        # Wait for user login if needed
        print("[+] Waiting for interface...")
        try:
            page.wait_for_selector("#prompt-textarea", timeout=15000)
        except:
            print("[!] Please login manually in the browser window.")
            page.wait_for_selector("#prompt-textarea", timeout=0)
        print(questions)
        for idx, question in enumerate(questions, start=1):
            print(f"    - Processing Q{idx}...")
            clear_overlays(page)

            # A. Enable Web Search Tool
            try:
                page.locator("button").filter(has=page.locator("svg")).first.click(timeout=5000)
                time.sleep(1)
                page.locator('[role="menuitem"]').filter(has_text="More").click(timeout=3000)
                time.sleep(1)
                page.locator('[role="menuitemradio"]').filter(has_text="Web search").click(timeout=3000)
            except:
                page.keyboard.press("Escape")

            # B. Send Question
            input_box = page.locator("#prompt-textarea")
            input_box.fill(question)
            time.sleep(1)
            page.keyboard.press("Enter")

            # C. Wait for Response (Voice Icon check)
            try:
                time.sleep(10)
                voice_btn = page.locator("article").last.get_by_label("Read aloud")
                voice_btn.wait_for(state="visible", timeout=20000)
                print(f"    - [✓] Q{idx} Answered.")
            except:
                print(f"    - [!] Q{idx} Voice icon timeout.")

            # D. Scrape Response
            time.sleep(3)
            last_msg = page.locator("article").last
            ans_text = last_msg.locator(".markdown").inner_text()
            
            citations = []
            # Scrape standard links
            links = last_msg.locator(".markdown a")
            for i in range(links.count()):
                url = links.nth(i).get_attribute("href")
                citations.append({
                    "text": links.nth(i).inner_text().strip(),
                    "url": url,
                    "domain": get_domain(url)
                })
            
            # Scrape gray bubbles/chips
            chips = last_msg.locator("span.bg-token-main-surface-secondary, button:has-text('Source')")
            for i in range(chips.count()):
                txt = chips.nth(i).inner_text().strip()
                # Avoid duplicates if chip text matches a link text
                if txt and txt not in [c['text'] for c in citations]:
                    citations.append({"text": txt, "url": "#", "domain": "Direct Chip"})

            final_data.append({
                "id": idx,
                "question": question,
                "answer": ans_text,
                "citations": citations,
                "my_brand_mentioned": my_brand.lower() in ans_text.lower(),
                "rank": calculate_rank(ans_text, my_brand, all_brands)
            })

        context.close()

    # 3. METRICS & RANKING LOGIC
    total_q = len(final_data)
    domain_freq = {}
    page_freq = {}
    
    # --- NEW: Calculate Total Citations Count ---
    total_citations_count = 1
    # --------------------------------------------

    leaderboard = []
    for b in all_brands:
        # Visibility
        mentions_count = len([d for d in final_data if b.lower() in d['answer'].lower()])
        
        # Citation Share calculation
        cit_count = 0
        for d in final_data:
            if any(b.lower() in c['text'].lower() or b.lower() in (c['url'] or "").lower() for c in d['citations']):
                cit_count += 1
        
        leaderboard.append({
            "brand": b,
            "visibility": (mentions_count / total_q) * 100 if total_q > 0 else 0,
            "citation_share": (cit_count / total_q) * 100 if total_q > 0 else 0,
            "is_me": b == my_brand
        })

    # Aggregating Citation Data
    for d in final_data:
        # Add to total count
        print(d['citations'])
        total_citations_count += len(d['citations'])

        for c in d['citations']:
            # Track Domains (exclude generic "Source" text)
            if c['domain'] != "Source" and c['domain'] != "Direct Chip":
                domain_freq[c['domain']] = domain_freq.get(c['domain'], 0) + 1
            
            # Track Specific Pages
            if c['url'] != "#":
                page_freq[c['url']] = page_freq.get(c['url'], 0) + 1

    # 4. JSON STORAGE
    session_record = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "metadata": {
            "category": category, 
            "my_brand": my_brand, 
            "competitors": competitive_brands
        },
        "metrics": {
            "visibility_score": (len([d for d in final_data if d['my_brand_mentioned']]) / total_q) * 100 if total_q > 0 else 0,
            
            # --- FIX: This field was missing in your logs ---
            "total_citations": total_citations_count,
            # ------------------------------------------------
            
            "total_answers": total_q,
            "rank_distribution": {
                "1st_rank": (len([d for d in final_data if d['rank'] == 1]) / total_q) * 100 if total_q > 0 else 0,
                "2nd_rank": (len([d for d in final_data if d['rank'] == 2]) / total_q) * 100 if total_q > 0 else 0,
                "3rd_rank_plus": (len([d for d in final_data if d['rank'] and d['rank'] >= 3]) / total_q) * 100 if total_q > 0 else 0
            },
            "leaderboard": sorted(leaderboard, key=lambda x: x['visibility'], reverse=True),
            
            # These are your Top Citations (Domains)
            "top_cited_domains": sorted([{"domain": k, "count": v} for k, v in domain_freq.items()], key=lambda x: x['count'], reverse=True)[:6],
            
            # These are your Top Citations (Specific Pages)
            "top_cited_pages": sorted([{"url": k, "count": v} for k, v in page_freq.items()], key=lambda x: x['count'], reverse=True)[:6]
        },
        "prompts": final_data,
        "recommendations": [
            f"Boost PR efforts to increase your {category} keyword footprint.",
            f"Brand '{my_brand}' ranked #1 in {len([d for d in final_data if d['rank']==1])} responses."
        ]
    }

    history = []
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            try: history = json.load(f)
            except: pass
    history.append(session_record)
    with open(HISTORY_FILE, "w") as f: json.dump(history, f, indent=4)
    print("[✓] Analysis Complete and Saved.")

# ---------------------------------
# API ENDPOINTS
# ---------------------------------
@app.post("/analyze")
async def trigger_analysis(request: AnalysisRequest, tasks: BackgroundTasks):
    tasks.add_task(run_full_analysis_task, request.my_brand, request.category, request.competitors)
    return {"status": "started", "message": "Browser is executing analysis in background."}

@app.get("/history")
async def get_history():
    if not os.path.exists(HISTORY_FILE): return []
    with open(HISTORY_FILE, "r") as f: return json.load(f)

@app.get("/latest")
async def get_latest():
    h = await get_history()
    if not h: raise HTTPException(status_code=404, detail="No sessions found")
    return h[-1]

@app.get("/prompts/mentioned")
async def get_mentioned():
    l = await get_latest()
    return [p for p in l.get('prompts', []) if p['my_brand_mentioned']]

@app.get("/prompts/not-mentioned")
async def get_not_mentioned():
    l = await get_latest()
    return [p for p in l.get('prompts', []) if not p['my_brand_mentioned']]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)