const express = require('express');

const router = express.Router();

const links = require('../controllers/linksController');

router.get('/', links.getWords);

router.get('/search', links.searchWord);

router.post('/results', links.results);


module.exports = router;
