const express = require('express');

const router = express.Router();

const LocalStorage = require('localStorage');

const links = require('../controllers/linksController');

router.get('/', links.getWords);

router.get('/search', links.searchWord);

router.post('/results/:page', links.results);

router.get('/results/:page', links.results);


module.exports = router;
