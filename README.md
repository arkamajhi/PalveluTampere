# Palvelu Tampere

Static website for Palvelu Tampere, prepared for GitHub Pages and the custom domain `palvelutampere.fi`.

## Pages

- Home: `index.html`
- Cleaning: `siivouspalvelut-tampere/`
- Moving: `muuttopalvelu-tampere/`

The site files are at the repository root. The GitHub Actions workflow publishes them whenever changes are pushed to `main`.

## Publish on GitHub Pages

1. Create an empty GitHub repository (do not add a README or license there).
2. From this folder, run the following commands, replacing `USERNAME/REPOSITORY` with the new repository path:

   ```sh
   git init -b main
   git add .
   git commit -m "Add Palvelu Tampere website"
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

   Or upload the files from this ZIP through GitHub's web interface.
3. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The included workflow deploys the site. Wait for its first successful run.
5. In **Settings → Pages**, enter `palvelutampere.fi` as the custom domain and enable **Enforce HTTPS** when available.
6. Configure the domain's DNS at its registrar for GitHub Pages. Use GitHub's current custom-domain instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

DNS must point to GitHub Pages for this hosting setup. The included `CNAME` file records the intended domain; GitHub's Pages settings also need the custom domain configured.

## Local preview

Open `index.html` in a browser, or serve this folder with any static file server.
