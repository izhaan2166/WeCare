# WeCare Hospital: website concept

A complete, multi-page website for a fictional multispeciality hospital, designed and built by **Vajha Agency** to show the standard of work we deliver for healthcare clients.

The hospital name, contact details, departments and facility descriptions are **sample content**. Nothing on the site claims accreditations, awards, statistics, outcomes or real staff.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Hero, quick access, introduction, departments, values, doctor preview, facilities, appointment CTA, patient information, visit journey, FAQ |
| About Us | `about.html` | Brand story, guiding principles, how care is organised, patient commitments, environment |
| Specialities | `specialities.html` | Sticky department index with scroll-spy, detailed department entries, "not sure where to start" help |
| Our Doctors | `doctors.html` | Directory with department filter and search, `?dept=` deep links, empty state |
| Patient Information | `patient-information.html` | Preparing for a visit, appointments, visitor guidelines, billing, patient rights, full FAQ |
| Book an Appointment | `appointment.html` | Validated enquiry form with safe preview, `?dept=` pre-selection |
| Contact Us | `contact.html` | Contact cards, hours and visiting, validated contact form |
| Privacy Policy, Terms | `privacy-policy.html`, `terms.html` | Draft legal pages, flagged for legal review |

## Preview

The finished site is in `dist/`. Open `dist/index.html` in a browser, or run a local server:

```
npm run preview        # builds, then serves dist/ at http://localhost:3000
```

Photographs load from Unsplash's image CDN, so an internet connection is needed unless you self-host them (see below).

## Editing content

Everything lives in `src/` and `site.config.json`. After any change, run `node build.mjs` (Node 18+; no dependencies) to regenerate `dist/`.

- **Hospital details** (`site.config.json`): name, phone numbers, email, hours, social links. No street address or map is shown; add them back only once the hospital confirms its location.
  - Phone numbers have a `verified` flag. Unverified numbers show as plain text. Set `verified: true` to switch on click-to-call (`tel:` links) and add the number to the structured data.
  - The **emergency line is hidden** everywhere until `emergency.verified` is `true` and a number is set. The footer always shows India's national emergency number, 112.
- **Departments** (`src/data/departments.json`): name, icon, one-line summary, introduction and "people often come to us for" list. Cards on the home page, the specialities page, the doctor filter, the footer and the form drop-downs are all generated from this file.
- **Photographs** (`src/data/images.json`): each image area has a key, alt text and crop position. Replace the `id` with the hospital's own photography before launch.
- **Doctor profiles**: the directory currently shows one clearly labelled *sample profile* per department. Replace the `doctor-cards` renderer in `build.mjs` with a data file of verified profiles (name, speciality, qualification, experience, approved photo) when the hospital supplies them. Filtering and search already work on whatever cards are rendered.
- **Pages** (`src/pages/*.html`): each page starts with a `<!--page {...} -->` header holding its title, meta description and active nav item. Shared pieces (header, footer, icons, CTA) are in `src/partials/`.

## Forms

The appointment and contact forms validate every field (Indian mobile numbers, email format, future dates, required choices, consent) and show an accessible error summary with links to each problem.

They run in **safe preview mode**: on a valid submission they show a summary of what *would* be sent and clearly say that nothing was sent or booked. No data is stored or transmitted.

To connect a backend later, set `data-endpoint` on the `<form>` and replace the preview call in `assets/js/main.js` with `WeCareForms.sendToBackend(endpoint, data)`, showing a "received" message only after a successful response. Health data should go only to a secure, consented, DPDP Act-compliant endpoint.

## Self-hosting the photographs

```
npm run images   # downloads every photo to assets/img/photos and updates images.json
npm run build
```

## Accessibility and SEO

Semantic landmarks, skip link, visible focus states, keyboard-operable menu (Escape closes it), ARIA accordion, labelled form controls with linked errors, `prefers-reduced-motion` support, AA colour contrast (a darker teal, `#0F6E6E`, is used for small text and buttons). Each page has its own title, meta description, canonical URL, Open Graph tags and breadcrumb; every page carries `Hospital` structured data (add `address` once confirmed, for local search). Update `siteUrl` in `site.config.json` before launch.

## Photo credits

All photographs are from [Unsplash](https://unsplash.com) under the Unsplash License. They are representative images only and do not show the hospital's staff, patients or premises.

| Key | Description | Photographer | Source |
| --- | --- | --- | --- |
| hero | A doctor listening to a patient during a consultation in a bright clinic office | Vitaly Gariev | https://images.unsplash.com/photo-1758691462863-9e1b8a863140 |
| intro | A doctor showing a patient a medical scan on a tablet | Vitaly Gariev | https://images.unsplash.com/photo-1758691463000-08b98131daf3 |
| introInset | A clinician's desk with a laptop and a stethoscope | National Cancer Institute | https://images.unsplash.com/photo-1576091160550-2173dba999ef |
| why | A doctor talking with a patient in a consultation room | Accuray | https://images.unsplash.com/photo-1666214278797-b2cc1b12be76 |
| reception | A bright hospital reception and lobby area | Martha Dominguez de Gouveia | https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d |
| room | A clean patient room with an adjustable hospital bed | Irshad Pathan | https://images.unsplash.com/photo-1778151270902-cb0ca572f2ee |
| consultRoom | Diagnostic instruments mounted on the wall of a consultation room | Brian Wangenheim | https://images.unsplash.com/photo-1766299892549-b56b257d1ddd |
| diagnostics | Rows of blood sample tubes in a laboratory rack | Testalize.me | https://images.unsplash.com/photo-1606206591513-adbfbdd7a177 |
| waiting | A quiet waiting area with a row of chairs beside large windows | Hermann Wittekopf | https://images.unsplash.com/photo-1706458315547-1a60ada6d278 |
| about | A smiling doctor in a white coat talking to a patient in a clinic | National Cancer Institute | https://images.unsplash.com/photo-1631217868264-e5b90bb7e133 |
| aboutCorridor | A calm hospital corridor with benches and consultation room doors | Tasha Kostyuk | https://images.unsplash.com/photo-1777269749032-d8d458ae594d |
| specialities | A doctor gently examining a child with a stethoscope | Vitaly Gariev | https://images.unsplash.com/photo-1758691462284-9eeec33fb0e7 |
| doctors | A doctor in conversation with a patient in a modern consultation room | Vitaly Gariev | https://images.unsplash.com/photo-1758691461957-474a7686e388 |
| patients | Comfortable padded armchairs in a waiting lounge | smallbox | https://images.unsplash.com/photo-1581982231900-6a1a46b744c9 |
| appointment | A doctor writing notes while a patient sits opposite | Vitaly Gariev | https://images.unsplash.com/photo-1758691463198-dc663b8a64e4 |
| contact | A modern reception desk with signage overhead | Malcolm Choong | https://images.unsplash.com/photo-1764727291644-5dcb0b1a0375 |

### Consultant card photos

The doctor cards use representative Unsplash stock portraits (in `assets/img/doctors`, set per department in `src/data/departments.json` under `portrait`). They are **not** WeCare staff, and every card stays labelled "Sample profile". Replace them with approved photographs of verified consultants before launch.

## Before launch checklist

- Replace all sample details in `site.config.json` and set `verified` flags.
- Confirm the department list with the clinical team.
- Add verified doctor profiles with approved photographs.
- Replace representative photos with the hospital's own photography (and obtain model releases).
- Have the Privacy Policy and Terms reviewed by legal counsel.
- Connect the forms to a secure backend.
- Add genuine, approved patient testimonials only if the hospital supplies them.

## Added features (November 2026)

- **WhatsApp**: floating chat button on every page, a WhatsApp card on Contact, and "Book on WhatsApp" on each health package. Number lives in `whatsapp` in `site.config.json`.
- **Forms that send**: after validation, the appointment and contact forms open WhatsApp with the request filled in. Set `emailVerified: true` to also offer "Send by email". To collect enquiries in a Google Sheet, deploy `scripts/google-sheet-endpoint.gs` (instructions at the top of the file) and paste its URL into `forms.endpoint`. The site shows "received" only after the endpoint confirms.
- **Hindi and Kannada**: language picker in the top bar. Translations live in `assets/js/i18n.js` and cover navigation, buttons, the home page, the appointment form and the main headings. Have a native speaker review them before launch; add a string by copying its exact English text as a new key.
- **New pages**: `health-packages.html`, `insurance.html`, `faq.html` (linked from the footer and Patient Information). Packages show typical inclusions only, with no prices.
