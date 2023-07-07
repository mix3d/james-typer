import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';
import fitty from 'fitty';

import styles from './App.module.css';
import github from './assets/github-mark.svg'

const CLEAR = ['Enter', 'Space']

let defaultVoice: SpeechSynthesisVoice | undefined

const preferredVoices = [
  "Google US English",
  "Microsoft Jenny Online (Natural) - English (United States)",
]

// By requesting the voices upfront, we avoid a situation where the list doesn't load and we switch voices after the first character
window.speechSynthesis.getVoices()

const createVoice = (string: string) => {
  // console.log("creating voice")
  var msg = new SpeechSynthesisUtterance(string);
  if (!defaultVoice) {
    // console.log("No default voice set")
    // ignore error, null still gets parsed as NaN
    const storageIndex = parseInt(window.localStorage.getItem("voiceIndex"))
    if (Number.isInteger(storageIndex) && storageIndex >= 0) {
      // console.log("index found: ", storageIndex)
      defaultVoice = window.speechSynthesis.getVoices()[storageIndex]
    }
    // check this we found a voice at the specified index
    if (!defaultVoice) {
      // console.log("Attempting to find preferred defaults from:", window.speechSynthesis.getVoices())
      defaultVoice = window.speechSynthesis.getVoices().find(v => v.name == preferredVoices[0] || v.name == preferredVoices[1])
    }
  }
  if (defaultVoice) {
    // console.log("found a default, setting voice", defaultVoice.name)
    msg.voice = defaultVoice
  }
  return msg
}

const App: Component = () => {

  let ref: HTMLDivElement

  const [inputString, setInputString] = createSignal("")
  const [speakingPhrase, setSpeakingPhrase] = createSignal(false)
  const [charIdx, setCharIdx] = createSignal(-1)

  let speakingArray: Array<SpeechSynthesisUtterance | undefined> = []
  let speakingIndex = -1

  const onKeypress = (e: KeyboardEvent) => {
    // don't let input happen when the whole phrase is queued.
    if (speakingPhrase()) return

    if (e.code.startsWith("Key")) {
      const char = e.code[3]
      const currIdx = inputString().length
      setInputString((prev) => prev + char)

      // speaks "Capital [Letter]" if you don't lowercase
      var msg = createVoice(char.toLowerCase())
      msg.rate = 1;
      msg.onstart = () => {
        // highlights the current index character
        setCharIdx(currIdx)
        // console.log("setting speakingIndex", speakingIndex, currIdx)
        speakingIndex = currIdx
      }
      msg.onend = () => {
        if (speakingIndex + 1 < speakingArray.length) {
          if (speakingArray[currIdx + 1] !== undefined)
            window.speechSynthesis.speak(speakingArray[currIdx + 1])
          //inserted a blank entry to the speaking array because of spaces, so start the next one
          else if (speakingArray[currIdx + 2] !== undefined)
            window.speechSynthesis.speak(speakingArray[currIdx + 2])
        }
        else {
          if (speakingIndex + 1 === speakingArray.length)
            speakingIndex++
        }

        // Unset the char underline regardless. Will get set per letter again.
        setCharIdx(-1)
      }
      speakingArray.push(msg)

      // console.log("should start again?!", speakingIndex, speakingArray.length)
      if ((speakingIndex === -1 && speakingArray.length === 1) || speakingIndex + 1 === speakingArray.length) {
        // console.log("starting speech")
        window.speechSynthesis.speak(msg)
      }

    }
    else if (e.code === 'Backspace') {
      setInputString(prev => prev.slice(0, -1))
      if (speakingIndex + 1 > speakingArray.length)
        speakingIndex--
      speakingArray.pop()
    }
    else if (e.code === 'Space') {
      if (inputString().slice(-1) !== '\xa0') {
        setInputString(prev => prev + '\xa0')
        speakingIndex++
        speakingArray.push(undefined)
      }
      else {
        // console.log("skipped a space")
      }
    }
    else if (CLEAR.includes(e.code)) {
      setSpeakingPhrase(true)
      speakingIndex = -1
      speakingArray = []
      var msg = createVoice(inputString())
      msg.rate = 0.75;
      msg.onend = () => {
        setInputString("")
        setSpeakingPhrase(false)
        // belt and suspenders?!
        // I think there's a race condition where the array index is not reset due to being set by the previous char's onEnd
        speakingArray = []
        speakingIndex = -1
      }
      window.speechSynthesis.speak(msg)
    }
  }

  createEffect(() => {
    if (ref) {
      fitty(ref)
    }
  })

  onMount(() => {
    document.addEventListener('keyup', onKeypress)
  })

  onCleanup(() => {
    document.removeEventListener('keyup', onKeypress)
  })

  return (
    <div class={styles.App}>
      <a class={styles.github} href="https://github.com/mix3d/james-typer">
        <img src={github} alt="Github logo"></img>
      </a>
      <div ref={ref}>
        <Show when={inputString().length}>
          <span class={styles.prompt}></span>
        </Show>
        <For each={inputString().split('')}>{(char, i) => (
          <span classList={{ [styles.active]: i() === charIdx() }}>{char}</span>
        )}</For>
        <span classList={{ [styles.prompt]: true, [styles.cursor]: !speakingPhrase() }}></span>
      </div>
    </div >
  );
};

export default App;
