# Palvelu Tampere

A Finnish-first, bilingual static website for moving and cleaning services in Tampere and Pirkanmaa.

## Pages

- `index.html`: the two service choices
- `siivouspalvelut-tampere/`: cleaning hub and cleaning reviews
- `muuttopalvelu-tampere/`: moving hub and moving reviews
- Dedicated detail pages for home, move-out, office/business, stairwell, deep, special and window cleaning; home and business moves, moving help, furniture transport and moving boxes.

## Prices

Prices appear on the service cards and their dedicated pages. Published rates and packages include 25.5% VAT. Move-out and home-move packages use one fixed amount for each home-size category.

## Edit reviews

Open the relevant hub or service page and find `data-review-carousel`. Each review is one hard-coded `<article class="review-slide">` inside `.review-track`. Copy, edit or remove an article; the carousel creates the correct number of dots automatically. Cleaning feedback appears only on cleaning pages and moving feedback only on moving pages. Review photos are illustrative images and visibly captioned; replace them with customer-approved review photos if available.

## Media and languages

Hero videos use muted autoplay and local WebP poster images for offline fallback. Video playback needs an internet connection. Finnish is the default language. The EN/FI switch is saved in `localStorage` and follows visitors between pages on this domain.

## Publish on GitHub Pages

1. Create a repository and upload these files from its root.
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. Add `palvelutampere.fi` as the custom domain and configure DNS with the registrar.
4. Enable HTTPS after DNS has propagated.

The included workflow publishes changes pushed to `main`.

## Guided booking requests

Every page has a floating booking button that opens the guided booking modal. Visitors select a service with buttons, add job details, and leave a phone number. After successful submission, the modal confirms that the team will call to confirm the booking.

GitHub Pages is static, so email notifications need a recipient inbox. Set `window.PT_BOOKING_EMAIL` in `booking-config.js` to the inbox that should receive booking requests. The form uses FormSubmit's AJAX endpoint; its first email requires inbox activation. Until the inbox is configured, the form tells visitors to call +358 44 931 8824, and does not claim that a request was sent.
