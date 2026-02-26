const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

let phoneBook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));


morgan.token("req-body", function (req, res) {
  return JSON.stringify(req.body);
});
morganMiddleware = morgan(
  ":method :url :status :req[content-length] - :response-time ms :req-body"
);
app.use(morganMiddleware);

app.get("/info", (request, response) => {
  const info = `
        <p>Phonebook has info for ${phoneBook.length} people</p>
        <p>${new Date()}</p>
    `;
  response.send(info);
});

app.get("/api/persons", (request, response) => {
  response.json(phoneBook);
});

app.post("/api/persons", (request, response) => {
  // Validation
  if (!request.body?.name || !request.body?.number) {
    return response
      .status(400)
      .json({ error: "Some fields are missing or empty" });
  }
  if (phoneBook.find((p) => p.name === request.body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const id = Math.floor(Math.random() * 1000000);
  const newPerson = {
    id,
    name: request.body.name,
    number: request.body.number,
  };
  phoneBook.push(newPerson);
  response.status(201).json(newPerson);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = phoneBook.find((p) => p.id === id);

  if (!person) {
    response.status(404).end();
  } else {
    response.json(person);
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  phoneBook = phoneBook.filter((p) => p.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
