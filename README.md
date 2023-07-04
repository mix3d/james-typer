# James Typer

My almost-three-year-old keeps trying to use my computer, so why not use that as an opportunity to help learn typing, letters, spelling, and pronounciation?

## Usage

Typed alpha-characters are displayed and spoken. Pressing `Enter` will speak the written word.

## Technology

- [SolidJS](https://www.solidjs.com/) for fast and lightweight reactivity
- [Fitty](https://github.com/rikschennink/fitty) for automatic text fitting
- The not-a-standard `SpeechSynthesis` browser feature for Text-To-Speech<br> _Note: Chrome has a built-in TTS engine that is better than most defaults: "Google US English"_
- Deployed to Vercel

I am fully aware that I am mixing Solid's signals and vanilla JS arrays, this was built in 4-6 hours during a holiday, with the majority of that time fixing edgecase bugs to ensure the letters are always spoken correctly, even when deleting typos. If you want to show a better way to implement this, please create a PR!

## Potential future features

- Service Worker to cache the site and make it work offline
- Feature detection for if TTS isn't available
- A dev mode to let you choose fonts and TTS voices, saving prefs to local storage
- Spellchecker with a "did you mean X" on submit, ideally with a fancy transition from the submitted text to the correct spelling
- A generative AI / other image search to find an appropriate image, if the object is a standard item (like an apple, house, etc) or an animal (Dog, Cat, horse, penguin, etc), which is then shown during the submission
- A submission history that's easily visible
- Raspberry Pi script to boot directly and fullscreen into the built site

In all likelihood, this will never happen, but one can dream!

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
