import test from 'node:test'
import assert from 'node:assert/strict'

test('0 required skills must not produce a fake high score',()=>{
  const required=[]
  const score=required.length===0?null:(0/required.length)*100
  assert.equal(score,null)
})
