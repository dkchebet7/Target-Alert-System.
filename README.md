📬 Productivity Target Alert Bot

This project automates weekly email reminders to different stakeholders (Associates, Team Leads, Project Managers) based on missing productivity target data pulled from BigQuery. The goal is to reduce delays and accountability gaps by proactively flagging incomplete target entries.

---

🚀 Features

* ⏱ **Scheduled Emails**: Automatically sends summaries every Monday, Wednesday, and Friday
* 📊 **BigQuery Integration**: Dynamically pulls the latest platform and target data
* 🧠 **Conditional Logic**:

  * Notifies Associates if they have platform hours but no assigned targets
  * Alerts TLs to assign targets if PMs have already set them
  * Reminds PMs to set targets when platform hours exist but targets haven’t been defined
* 📥 **Clean HTML Emails**: Delivers clear, tabular summaries of what’s missing

---

📅 Email Schedule

| Day         | Range Covered           | Purpose                    |
| ----------- | ----------------------- | -------------------------- |
| Monday      | Previous Week (Mon–Sun) | Weekly catch-up            |
| Wednesday   | Current Week (Mon–Tue)  | Midweek progress check     |
| Friday      | Current Week (Mon–Thu)  | Pre-weekend follow-up      |
| Last Friday | Full Month              | Monthly compliance summary |

---

🛠️ Tech Stack

* **Google Apps Script** (for automation)
* **BigQuery SQL** (for querying data)
* **Gmail API** (for sending emails)
* **HTML** (for formatting the messages)

---

### 🗂️ File Structure

```
📁 productivity-target-alert-bot/
│
├── script.gs           → Main script logic (Google Sheets / Apps Script)
├── README.md           → Project overview and usage
├── mock_data.csv       → (Optional) Sample of anonymized data structure
```

---

### 🧪 Sample Email Output

```html
Hello [Manager Name],

Below is a summary of workflows with missing productivity targets:

| Workflow     | Step Type      | Dates               |
|--------------|----------------|---------------------|
| Image Review | Annotation     | Jul 8, Jul 10, Jul 11|
| Transcription| QA             | Jul 9               |

Please take the necessary actions.

Best regards,  
Analytics Bot
```

---

### ⚠️ Note on Privacy

This script is a sanitized version of an internal tool. All organization-specific table names, project identifiers, and personal emails have been removed or renamed to maintain confidentiality.

---

### 🙋‍♀️ Author

Built by Daisy Chebet, with love for automating boring workflows.
If you'd like to collaborate or discuss data ops automation, feel free to reach out!

