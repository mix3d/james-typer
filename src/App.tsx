import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';
import fitty from 'fitty';

import styles from './App.module.css';

const CLEAR = ['Enter', 'Space']

const createVoice = (string: string) => {
  var msg = new SpeechSynthesisUtterance(string);
  const defaultVoice = window.speechSynthesis.getVoices().find(v => v.name == "Google US English")
  if (defaultVoice)
    msg.voice = defaultVoice
  return msg
}

const App: Component = () => {

  let ref: HTMLDivElement

  const [string, setString] = createSignal("")
  const [speaking, setSpeaking] = createSignal(false)
  const [letterIdx, setIdx] = createSignal(-1)

  const speakingArray: SpeechSynthesisUtterance[] = []
  let speakingIndex = -1

  const onKeypress = (e: KeyboardEvent) => {
    if (speaking()) return

    if (e.code.startsWith("Key")) {
      const char = e.code[3]
      const currIdx = string().length
      setString((prev) => prev + char)

      var msg = createVoice(char.toLowerCase())
      msg.rate = 1;
      msg.onstart = () => {
        setIdx(currIdx)
      }
      msg.onend = () => {

        // TODO: create a queue locally instead of relying on the SpeachSynthesis' queue, 
        // so you can delete un-spoken letters without them being queued

        // console.log(letterIdx(), speakingArray.length)
        // if (speakingArray.length > letterIdx() + 1) {
        //   console.log("speaking the next letter")
        //   window.speechSynthesis.speak(speakingArray[currIdx + 1])
        // }
        // else {
        // }
        setIdx(-1)
      }
      // speakingArray.push(msg)

      // console.log(currIdx, letterIdx())
      // if (currIdx === 0 || currIdx - 1 === letterIdx())
      window.speechSynthesis.speak(msg)

    }
    else if (e.code === 'Backspace') {
      setString(prev => prev.slice(0, -1))

      //TODO: test if currently spoken letter is the one being deleted 

      // speakingArray.pop()
    }
    else if (e.code === 'Space')
      setString(prev => prev + '\xa0')
    else if (CLEAR.includes(e.code)) {
      setSpeaking(true)
      var msg = createVoice(string())
      msg.rate = 0.75;
      msg.onend = () => {
        setString("")
        setSpeaking(false)
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
        <Show when={string().length}>
          <span class={styles.prompt}></span>
        </Show>
        <For each={string().split('')}>{(char, i) => (
          <span classList={{ [styles.active]: i() === letterIdx() }}>{char}</span>
        )}</For>
        <span classList={{ [styles.prompt]: true, [styles.cursor]: !speaking() }}></span>
      </div>
    </div >
  );
};

export default App;
