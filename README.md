# The AI Instructor Brief

Self-hosted newsletter signup and delivery system — built with Claude.

## Stack
- **Signup page** — `index.html` hosted on Netlify
- **Backend** — Google Apps Script (`apps-script/Code.gs`) handles subscriber storage + welcome emails
- **Subscriber list** — Google Sheets
- **Email delivery** — AgentMail API

## Setup
1. Open your Google Sheet → Extensions → Apps Script
2. Paste contents of `apps-script/Code.gs`
3. Deploy as Web App (Anyone can access)
4. Update `APPS_SCRIPT_URL` in `index.html` with your deployment URL
5. Connect this repo to Netlify for auto-deploy

## How it works
1. Reader fills out form at theaibrief.netlify.app
2. Form POSTs to Apps Script web app
3. Apps Script saves email to Google Sheets + fires welcome email via AgentMail
4. Every Monday at 7am SGT, scheduled task reads the Sheet and sends the newsletter
