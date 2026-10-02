const data = {
  messages: [{ role: 'user', content: 'top 2 priority leads' }],
  mode: 'global'
};

fetch('http://localhost:8005/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(async res => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
})
.catch(err => console.error(err));
