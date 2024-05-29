const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const booksFilePath = path.join(__dirname, 'data', 'livros.json');

const loadBooks = () => {
    try {
        if (fs.existsSync(booksFilePath)) {
            const data = fs.readFileSync(booksFilePath);
            return JSON.parse(data).books;
        } else {
            console.error('Arquivo livros.json não encontrado');
            return [];
        }
    } catch (err) {
        console.error('Erro ao ler o arquivo livros.json:', err);
        return [];
    }
};

const saveBooks = (books) => {
    try {
        fs.writeFileSync(booksFilePath, JSON.stringify({ books }, null, 2));
    } catch (err) {
        console.error('Erro ao salvar o arquivo livros.json:', err);
    }
};

// Listagem dos livros
app.get('/books', (req, res) => {
    const books = loadBooks();
    res.json(books);
});

// Cadastro de novos livros
app.post('/books', (req, res) => {
    const books = loadBooks();
    const newBook = {
        id: uuidv4(),
        titulo: req.body.titulo,
        autor: req.body.autor,
        genero: req.body.genero,
        imagem: req.body.imagem,
        "cópias disponíveis": req.body["cópias disponíveis"]
    };
    books.push(newBook);
    saveBooks(books);
    res.status(201).json(newBook);
});

// Compra de um livro
app.post('/books/:id/buy', (req, res) => {
    const books = loadBooks();
    const bookId = req.params.id;
    const book = books.find(b => b.id === bookId);

    if (book) {
        if (book["cópias disponíveis"] > 0) {
            book["cópias disponíveis"] -= 1;
            saveBooks(books);
            res.json({ message: 'Livro comprado com sucesso!', book });
        } else {
            res.status(400).json({ message: 'Livro fora de estoque!' });
        }
    } else {
        res.status(404).json({ message: 'Livro não encontrado!' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
