try {
  new URL('file:./dev.db');
  console.log('Worked 1');
} catch (e) {
  console.log('Failed 1', e.message);
}
try {
  new URL('file:dev.db');
  console.log('Worked 2');
} catch (e) {
  console.log('Failed 2', e.message);
}
try {
  new URL('file:///dev.db');
  console.log('Worked 3');
} catch (e) {
  console.log('Failed 3', e.message);
}
