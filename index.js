const express = require('express');
const path = require('path'); 
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Home route
app.get('/', function (req, res) {
    fs.readdir('./files', function (err, files) {
        res.render('index', { files: files });
    });
});

// Read individual file
app.get('/file/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
       res.render('show', {
            filename: req.params.filename,
            filedata: filedata
        });
    });
});

// Create a new file
app.post('/create', function (req, res) {
    const cleanTitle = req.body.title.split(' ').join('');
    fs.writeFile(`./files/${cleanTitle}.txt`, req.body.details, function (err) {
        res.redirect("/");
    });
});

//edit route
app.get('/edit/:filename', function (req, res) {
    res.render('edit' , {filename : req.params.filename})
});

//renaming the file
app.post('/edit', function (req, res) {
    fs.rename(`./files/${req.body.previous}`, `./files/${req.body.new}`, function(err){
        res.redirect("/");
    });
});

//update content
app.post('/update-content', function (req, res) {
    const { filename, content } = req.body;

    fs.writeFile(`./files/${filename}`, content, function (err) {
        if (err) {
            console.error('Error updating file:', err);
            return res.status(500).send('Error saving changes.');
        }
        res.redirect(`/file/${filename}`);
    });
});

//delete route
app.post('/delete/:filename', function (req, res) {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'files', filename);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, function (err) {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Unable to delete file');
            }

            console.log(`File ${filename} deleted successfully.`);
            res.redirect('/');
        });
    } else {
        console.log(`File ${filename} not found.`);
        res.status(404).send('File not found');
    }
});

app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});
