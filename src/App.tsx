import React, {  useState } from 'react';
import './App.css';
const FONT_S = 20
const HELLO_WORLD =
  `>++++++++[<+++++++++>-]<.
>++++[<+++++++>-]<+.
+++++++..
+++.
>>++++++[<+++++++>-]<++.
------------.
>++++++[<+++++++++>-]<+.
<.
+++.
------.
--------.
>>>++++[<++++++++>-]<+.`

const BF_CHARACTERS = [

  '>', //Increment the data pointer (to point to the next cell to the right).
  '<', //Decrement the data pointer (to point to the next cell to the left).
  '+', //Increment (increase by one) the byte at the data pointer.
  '-', //Decrement (decrease by one) the byte at the data pointer.
  '.', //Output the byte at the data pointer.
  ',', //Accept one byte of input, storing its value in the byte at the data pointer.
  '[', //If the byte at the data pointer is zero, then instead of moving the instruction pointer forward to the next command, jump it forward to the command after the matching ] command.
  ']' //If the byte at the data pointer is nonzero, then instead of moving the instruction pointer forward to the next command, jump it back to the command after the matching [ command.
]
const TIMEOUT = 15

function App() {
  const [userCode, setUserCode] = useState(HELLO_WORLD) //we treat code as a state so we can update the clanCode live
  const [memory, setMemory] = useState([0])
  let [pointerI, setPointerI] = useState(0)
  let [executionI, setExecutionI] = useState(0)
  let [output, setOutput] = useState('')

  function inputHandler(e: React.FormEvent) {
    const target = e.target as HTMLTextAreaElement
    const codigo = target.value
    setUserCode(codigo)
  }
  const code = Array.from(userCode)
    .filter(x => BF_CHARACTERS.includes(x))
    .join('')

  function timeout(msTimeout: number) {
    return new Promise(resolve => setTimeout(resolve, msTimeout))
  }

  async function runCode(/*e: React.MouseEvent<HTMLButtonElement, MouseEvent>*/) {
    let out = output
    const mem = memory
    //console.log('memory', memory[0])
    let p = pointerI
    let exit = 1000
    for (let i = 0; i < code.length; i++) {
      exit--
      if (exit <= 0) {
        console.error('exit')
        break
      }
      const char = code[i];
      //console.log('char',char)
      switch (char) {
        case '+':
          mem[p]++
          break
        case '-':
          mem[p]--
          break
        case '>':
          p++
          break
        case '<':
          p--
          break
        case '[':
          //console.log('memP', mem[p])
          if (mem[p] === 0) {
            //TODO more efficient would be to go in a loop with i backwards of forwards
            i = code.slice(i).indexOf(']') + i + 1
            //console.log('forward to',i)
          }
          break
        case ']':
          if (mem[p] !== 0) {
            //TODO more efficient would be to go in a loop with i backwards of forwards
            i = code.slice(0, i).lastIndexOf('[')
            //console.log('backward to',i)
          }
          break
        case '.':
          out = out + String.fromCharCode(mem[p])
          console.log(String.fromCharCode(mem[p]))

      }

      //if (char == '+') {
      //  mem[p]++
      //}else
      //if (char == '>') {
      //  p++
      if (mem.length - 1 < p) {
        mem.push(0)
      }
      if (p < 0) {
        alert('pointer is less than 0')
        p = 0
      }
      //}
      setMemory(Array.from(mem))
      setPointerI(p)
      setExecutionI(i)
      setOutput(out)

      await timeout(TIMEOUT)

    }

  }


  const memoryElements = memory.map((x, i) => (
    <span key={i}>
      {i === pointerI ? <b>{x}</b> : x}{i < memory.length - 1 ? ',' : ''}
    </span >
  ))
  function clearState() {
    setMemory([0])
    setPointerI(0)
  }

  const codeElement = <span>{Array.from(code).map((c, i) => {
    if (i === executionI) {
      ////console.log('executionI',executionI)
      return <b style={{fontSize:(FONT_S+3)+'px'}} key={i}>{c}</b>
    } else {
      return <span key={i}>{c}</span>
    }

  })}</span>

  return (
    <div className="App" style={{ margin: 'auto', maxWidth: '800px' }}>
      <textarea defaultValue={HELLO_WORLD} onInput={inputHandler} onSubmit={runCode} ></textarea>

      <h4> Code: </h4>
      <p style={{ fontSize: FONT_S + 'px' }}>
        {codeElement}  <button onClick={runCode}>Run</button> <button onClick={clearState}>Reset</button>
      </p>
      <h4> Memory: </h4>
      <p>
        {memoryElements}
      </p>
      <h4>Output</h4>
      <p>
        {output}
      </p>
    </div>
  );
}

export default App;
