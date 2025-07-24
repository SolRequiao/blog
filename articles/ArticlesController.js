const express = require('express');
const router = express.Router();

router.get('/articles', (req, res) => {
    res.send('Router of articles',
        {
            page_title: 'Articles'
        });
});

module.exports = router;
