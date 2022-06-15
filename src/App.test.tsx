import React from 'react';
import { render, screen } from '@testing-library/react';
import App, {findBracketPair} from './App';


test('matchPair function',()=>{
  let result = findBracketPair('+++[--]',3)
  expect(result).toBe(6)
  result = findBracketPair('+++[--',3)
  expect(result).toBe(-1)
  result = findBracketPair('+++[[--]-]',3)
  expect(result).toBe(9)
  result = findBracketPair('+++[[--]-]',9)
  expect(result).toBe(3)

})
//test('renders learn react link', () => {
//  render(<App />);
//  const linkElement = screen.getByText(/learn react/i);
//  expect(linkElement).toBeInTheDocument();
//});
