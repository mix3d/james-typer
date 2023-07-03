import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';
import fitty from 'fitty';

import styles from './App.module.css';

const CLEAR = ['Enter', 'Space']

let defaultVoice: SpeechSynthesisVoice | undefined

const createVoice = (string: string) => {
  var msg = new SpeechSynthesisUtterance(string);
  if (!defaultVoice)
    defaultVoice = window.speechSynthesis.getVoices().find(v => v.name == "Google US English")
  else if (defaultVoice)
    msg.voice = defaultVoice
  return msg
}

const App: Component = () => {

  let ref: HTMLDivElement

  const [inputString, setInputString] = createSignal("")
  const [speakingPhrase, setSpeakingPhrase] = createSignal(false)
  const [charIdx, setCharIdx] = createSignal(-1)

  let speakingArray: SpeechSynthesisUtterance[] = []
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
          window.speechSynthesis.speak(speakingArray[currIdx + 1])
        }
        else {
          speakingIndex++
        }

        // Unset the char underline regardless. Will get set per letter again.
        setCharIdx(-1)
      }
      speakingArray.push(msg)

      if ((speakingIndex === -1 && speakingArray.length === 1) || speakingIndex + 1 === speakingArray.length) {
        window.speechSynthesis.speak(msg)
      }

    }
    else if (e.code === 'Backspace') {
      setInputString(prev => prev.slice(0, -1))

      //TODO: test if currently spoken letter is the one being deleted 
      if (speakingIndex >= 0)
        speakingIndex--
      speakingArray.pop()
    }
    else if (e.code === 'Space') {
      setInputString(prev => prev + '\xa0')
      speakingIndex++
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
