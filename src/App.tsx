import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
//import './App.css';
const FONT_S = 20
let executionTimeout = 5
let stop = false
const HELLO_WORLD = `
[ This program prints "Hello World!" and a newline to the screen, its
  length is 106 active command characters [it is not the shortest.]
 
  This loop is a "comment loop", it's a simple way of adding a comment
  to a BF program such that you don't have to worry about any command
  characters. Any ".", ",", "+", "-", "<" and ">" characters are simply
  ignored, the "[" and "]" characters just have to be balanced.
]
+++++ +++               Set Cell #0 to 8
[
    >++++               Add 4 to Cell #1; this will always set Cell #1 to 4
    [                   as the cell will be cleared by the loop
        >++             Add 2 to Cell #2
        >+++            Add 3 to Cell #3
        >+++            Add 3 to Cell #4
        >+              Add 1 to Cell #5
        <<<<-           Decrement the loop counter in Cell #1
    ]                   Loop till Cell #1 is zero; number of iterations is 4
    >+                  Add 1 to Cell #2
    >+                  Add 1 to Cell #3
    >-                  Subtract 1 from Cell #4
    >>+                 Add 1 to Cell #6
    [<]                 Move back to the first zero cell you find; this will
                        be Cell #1 which was cleared by the previous loop
    <-                  Decrement the loop Counter in Cell #0
]                       Loop till Cell #0 is zero; number of iterations is 8
 
The result of this is:
Cell No :   0   1   2   3   4   5   6
Contents:   0   0  72 104  88  32   8
Pointer :   ^
 
>>.                     Cell #2 has value 72 which is 'H'
>---.                   Subtract 3 from Cell #3 to get 101 which is 'e'
+++++++..+++.           Likewise for 'llo' from Cell #3
>>.                     Cell #5 is 32 for the space
<-.                     Subtract 1 from Cell #4 for 87 to give a 'W'
<.                      Cell #3 was set to 'o' from the end of 'Hello'
+++.------.--------.    Cell #3 for 'rl' and 'd'
>>+.                    Add 1 to Cell #5 gives us an exclamation point
>++.                    And finally a newline from Cell #6
`

const BF_CHARACTERS = [
  '>', //Increment the data pointer (to point to the next cell to the right).
  '<', //Decrement the data pointer (to point to the next cell to the left).
  '+', //Increment (increase by one) the byte at the data pointer.
  '-', //Decrement (decrease by one) the byte at the data pointer.
  '.', //Output the byte at the data pointer.
  ',', //Accept one byte of input, storing its value in the byte at the data pointer.
  '[', //If the byte at the data pointer is zero, then instead of moving the instruction pointer forward to the next command, jump it forward to the command after the matching ] command.
  ']', //If the byte at the data pointer is nonzero, then instead of moving the instruction pointer forward to the next command, jump it back to the command after the matching [ command.
]

export function findBracketPair(code: string, i: number): number {
  //TODO refactor
  const char = code[i]
  if (char == ']') {
    let closeBrackets = 1
    while (i >= 0) {
      i--
      if (code[i] == ']') {
        closeBrackets++
      }
      if (code[i] == '[') {
        closeBrackets--
        if (closeBrackets == 0) {
          return i
        }
      }
    }
    return -1
  }
  if (char == '[') {
    let openBrackets = 1
    while (i < code.length - 1) {
      i++
      if (code[i] == '[') {
        openBrackets++
      }
      if (code[i] == ']') {
        openBrackets--
        if (openBrackets == 0) {
          return i
        }
      }
    }
    return -1
  }
  console.log('char', char)
  return i
}

function App() {
  const [userCode, setUserCode] = useState(
    localStorage.getItem('code') ?? HELLO_WORLD
  ) //we treat code as a state so we can update the clanCode live
  const [memory, setMemory] = useState([0])
  let [pointerI, setPointerI] = useState(0)
  let [pointerIS, setPointerIS] = useState(0)
  let [executionI, setExecutionI] = useState(0)
  let [output, setOutput] = useState('')
  let [inputString, setInputString] = useState('')

  function inputHandler(e: React.FormEvent) {
    const target = e.target as HTMLTextAreaElement
    const codigo = target.value
    setUserCode(codigo)
    localStorage.setItem('code', codigo)
  }
  const code = Array.from(userCode)
    .filter((x) => BF_CHARACTERS.includes(x))
    .join('')

  function timeout(msTimeout: number) {
    return new Promise((resolve) => setTimeout(resolve, msTimeout))
  }
  function stopExecution() {
    stop = true
  }

  async function runCode(/*e: React.MouseEvent<HTMLButtonElement, MouseEvent>*/) {
    let out = output
    const mem = memory
    //console.log('memory', memory[0])
    let p = pointerI
    let pIS = pointerIS
    let exit = 10 ** 5
    for (let i = 0; i < code.length; i++) {
      if (stop) {
        stop = false
        break
      }
      exit--
      if (exit <= 0) {
        console.error('exit')
        break
      }
      const char = code[i]
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
            i = findBracketPair(code, i) // Por algum mutivo tinha colocado +1 aki
            //TODO more efficient would be to go in a loop with i backwards of forwards
            //i = code.slice(i).indexOf(']') + i + 1
            //console.log('forward to',i)
          }
          break
        case ']':
          if (mem[p] !== 0) {
            i = findBracketPair(code, i)
            //TODO more efficient would be to go in a loop with i backwards of forwards
            //i = code.slice(0, i).lastIndexOf('[')
            //console.log('backward to',i)
          }
          break
        case ',':
          if(pIS > inputString.length -1){ 
            mem[p] = 0 
            break
            }
          mem[p] = inputString.charCodeAt(pIS)
          pIS++
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
        stopExecution()
        p = 0
      }
      //}
      setMemory(Array.from(mem))
      setPointerI(p)
      setPointerIS(pIS)
      setExecutionI(i)
      setOutput(out)

      if (executionTimeout > 0) {
        await timeout(executionTimeout)
      }
    }
  }

  const memoryElements = memory.map((x, i) => (
    <span key={i}>
      {i === pointerI ? <b>{x}</b> : x}
      {i < memory.length - 1 ? ',' : ''}
    </span>
  ))
  function clearState() {
    stopExecution()
    setMemory([0])
    setPointerI(0)
    setPointerIS(0)
    setOutput('')
  }

  const codeElement = (
    <span>
      {Array.from(code).map((c, i) => {
        if (i === executionI) {
          ////console.log('executionI',executionI)
          return (
            <b style={{ fontSize: FONT_S + 3 + 'px' }} key={i}>
              {c}
            </b>
          )
        } else {
          return <span key={i}>{c}</span>
        }
      })}
    </span>
  )

  return (
    <div className='App container pt-5'>
      <div className='card'>
        <div className='card-header'>
          <label className='form-label' htmlFor='input-code'>
            <h4>BrainFuck:</h4>
          </label>
        </div>
        <textarea
          id='input-code'
          rows={15}
          className='form-control'
          defaultValue={localStorage.getItem('code') ?? HELLO_WORLD}
          onInput={inputHandler}
          onSubmit={runCode}
        ></textarea>
      </div>

      <div className='card'>{/*TODO make input chars before pointerIS gray*/}
        <div className='card-header'>
          <label className='form-label' htmlFor='input-string'>
            <h4>Input:</h4>
          </label>
        </div>
        <textarea
          id='input-string'
          rows={2}
          className='form-control'
          onInput={(e:any)=>setInputString(e.target.value)}
          value={inputString}
          onSubmit={runCode}
        ></textarea>
      </div>

      <div className='card'>
        <div className='card-header'>
          <h5> Code: </h5>
        </div>
        <div className='card-body'>
          <p>{codeElement}</p>
          <div
            className='container btn-group'
            role='group'
            aria-label='Basic outlined example'
          >
            <button className='btn btn-outline-primary' onClick={runCode}>
              Run
            </button>
            <button className='btn btn-outline-primary' onClick={clearState}>
              Reset
            </button>
            <button className='btn btn-outline-primary' onClick={stopExecution}>
              Stop
            </button>
          </div>
            <label className="form-label" htmlFor="timeout">Execution speed:</label>
          <input id="timeout" className="form-range" type="range" value = {executionTimeout} min={0} max={1000} onInput={(e:any)=>executionTimeout=e.target.valueAsNumber}></input>
        </div>
      </div>
      <div className='card'>
        <div className='card-header'>
          <h5>State</h5>
        </div>

        <ul>
          <li>
            <h6> Memory: </h6>
            <p>{memoryElements}</p>
          </li>
          <li>
            <h6>Output</h6>
            <p>{output}</p>
          </li>
        </ul>
      </div>
    </div>
  )
}

//TODO Adicionar stop como o fim do slider de velocidade
//TODO Adicionar debug char q dexa lento
// TODO mudar scala do slider pra log
export default App
