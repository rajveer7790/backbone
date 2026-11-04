# Tax Invoice — Backbone First LLP

A one-page GST invoice maker. No server, no database, no sign-up — it runs entirely in the browser.

## Files

```
backbone-invoice/
├── index.html    the page
├── app.js        invoice logic (tax maths, preview, PDF)
├── style.css     layout + invoice design
├── config.js     YOUR company details (edit this)
├── lib/          PDF libraries (html2canvas, jsPDF) — works offline
└── fonts/        Barlow font
```

## Use it

- **On your computer:** double-click `index.html`.
- **Host it:** upload the whole folder (keep the folder structure) to any static host:
  - Netlify Drop — drag the folder onto app.netlify.com/drop
  - GitHub Pages — push the folder to a repo, enable Pages
  - Your own server / cPanel — upload to `public_html/invoice/`

## Making an invoice

1. Fill **Invoice** (number auto-fills: `BF/26-27/0001`), **Bill to**, **Products**.
2. **Tax type:**
   - **Auto** — IGST if the buyer's state differs from yours, CGST + SGST if same.
   - **IGST only** — forces one IGST column.
   - **CGST + SGST** — forces two columns (half each).
3. **Download PDF** or **Print** (Print → "Save as PDF" also works).
4. **New invoice** clears the form and moves to the next number.

The table only has as many rows as products you add. Shipping appears only if you enter an amount.

## Company details

Edit `config.js`, or open **Company details** on the page (saved in that browser).
Logo and signature: upload on the page, or put `logo.png` / `sign.png` in the folder and set
`logo: "logo.png"` in `config.js`.

> If you host this on a public website, anyone with the link can read `config.js`
> (including the bank account). Use a private/password-protected location, or leave bank
> fields empty in `config.js` and fill them on the page instead (stored only in your browser).

Drafts and the last invoice number are stored in the browser (localStorage). Clearing browser
data resets them — keep your downloaded PDFs as the record.
