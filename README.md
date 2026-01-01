# Brand-Insight-Hub_AtharvaDeshpande
Brand Insight Hub is a modern analytics dashboard designed to measure and compare brand visibility across AI-Powered Platforms like ChatGPT,DeepSeek etc. It provides a centralized, intuitive interface for tracking key performance metrics  enabling data-driven decision-making for marketing and strategy teams..


An enterprise-grade, asynchronous engine designed to track brand visibility, citation share, and mention rankings across LLM responses (ChatGPT). This tool utilizes **NVIDIA Llama-3.3** for intelligent question generation and **Playwright** for high-fidelity browser automation.

## 🚀 Key Features

- **Automated AI Intelligence:** Generates non-branded, search-optimized questions using NVIDIA's Llama-3.3 API.
- **Stealth Automation:** Uses Playwright with stealth configurations to interact with ChatGPT, bypassing bot detection.
- **Event-Driven Execution:** Captures responses by monitoring the DOM for the "Read Aloud" icon, ensuring maximum execution speed.
- **Advanced Metrics:**
    - **AI Visibility Score:** % of answers mentioning the brand.
    - **Citation Share:** % of citations linking to the brand's domain.
    - **Mention Ranking:** Tracks if the brand is mentioned 1st, 2nd, or 3rd+.
- **JSON Ledger:** Maintains a persistent, audit-ready history of all prompts, answers, and metrics.
- **FastAPI Integration:** Fully decoupled backend with background task processing and CORS support for modern UI integration.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **LLM Engine:** OpenAI SDK (NVIDIA NIM Endpoint)
- **Browser Automation:** Playwright (Chromium)
- **Data Persistence:** JSON (Session-based Ledger)

---

## 📋 Prerequisites

1. **Python 3.9+**
2. **NVIDIA API Key:** Get it from [NVIDIA Build](https://build.nvidia.com/).
3. **ChatGPT Account:** Manual login is required on the first run to establish a persistent session.

---

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-visibility-tracker.git
   cd ai-visibility-tracker
   ```

2. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn playwright playwright-stealth openai
   ```

3. **Install Playwright Browsers:**
   ```bash
   playwright install chromium
   ```

---

## 🚦 How to Use

### 1. Configure the API Key
Open `api.py` and replace the placeholder in the `client` initialization with your actual NVIDIA API Key:
```python
api_key = "nvapi-YOUR_ACTUAL_KEY_HERE"
```

### 2. Start the FastAPI Server
Run the following command in your terminal:
```bash
python api.py
```
The server will start at `http://127.0.0.1:8000`.

### 3. Establish the ChatGPT Session (First Run Only)
- The first time you trigger an analysis, a browser window will open.
- **Manually log in** to your ChatGPT account.
- Once logged in, the script will detect the input box and begin the automated process. 
- *Note: Your session is saved in the `/chatgpt_session` folder.*

### 4. Trigger an Analysis
Use Postman or `curl` to send a POST request:
- **Endpoint:** `http://127.0.0.1:8000/analyze`
- **Method:** `POST`
- **Body (JSON):**
```json
{
  "my_brand": "Asana",
  "category": "Project Management Tools",
  "competitors": "Trello, ClickUp, Notion"
}
```

---

## 📡 API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/analyze` | `POST` | Triggers the LLM question generation and browser automation. |
| `/latest` | `GET` | Fetches the metrics and data from the most recent session. |
| `/history` | `GET` | Returns the full list of all sessions for trend analysis. |
| `/prompts/mentioned` | `GET` | Returns prompts where `my_brand` was successfully mentioned. |
| `/prompts/not-mentioned` | `GET` | Returns prompts where the brand was missing (Gap Analysis). |

---

## 📂 Project Structure

- `api.py`: The main FastAPI application and automation engine.
- `chatgpt_history.json`: Persistent storage for all analysis results (created after first run).
- `chatgpt_session/`: Folder containing browser cookies and session state.
- `README.md`: Documentation.
